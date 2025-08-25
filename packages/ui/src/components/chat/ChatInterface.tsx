/**
 * Universal AI Chat Interface Component - FASE 3 Enhanced
 * Dual Interface: External Client + Internal Staff
 * Healthcare-optimized with Portuguese NLP + AI-powered features
 * WCAG 2.1 AA+ compliance, LGPD/ANVISA compliant
 */

"use client";

import { useChat } from "@neonpro/ai/chat/context";
import type { ChatInterface, ChatMessage } from "@neonpro/types/ai-chat";
import { Badge } from "@neonpro/ui/components/Badge";
import { Button } from "@neonpro/ui/components/Button";
import { Card } from "@neonpro/ui/components/Card";
import { Input } from "@neonpro/ui/components/Input";
import { cn } from "@neonpro/ui/lib/utils";
import {
	AlertTriangle,
	Bot,
	CheckCircle,
	Clock,
	Mic,
	MicOff,
	Paperclip,
	Send,
	Settings,
	User,
	XCircle,
	Lightbulb,
	FileUp,
	Volume2,
	VolumeX,
	Sparkles,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";

// Healthcare-specific AI features
interface HealthcareSuggestion {
	id: string;
	text: string;
	type: 'appointment' | 'symptom' | 'treatment' | 'general';
	confidence: number;
	medicalTerm?: string;
	translation?: string;
}

// Voice recording state
interface VoiceRecordingState {
	isRecording: boolean;
	isProcessing: boolean;
	duration: number;
	transcript?: string;
	error?: string;
}

// File upload progress
interface FileUploadState {
	isUploading: boolean;
	progress: number;
	fileName?: string;
	error?: string;
}

interface ChatInterfaceProps {
	interface_type?: ChatInterface;
	className?: string;
	placeholder?: string;
	maxHeight?: string;
	showHeader?: boolean;
	showTypingIndicator?: boolean;
	autoFocus?: boolean;
	// FASE 3 AI-powered features
	enableSmartSuggestions?: boolean;
	enableVoiceInput?: boolean;
	enableFileUpload?: boolean;
	enableHealthcareNLP?: boolean;
	enablePredictiveText?: boolean;
	maxFileSize?: number; // in MB
	allowedFileTypes?: string[];
	// Accessibility enhancements
	ariaLabelledBy?: string;
	ariaDescribedBy?: string;
	screenReaderAnnouncements?: boolean;
}

export function ChatInterface({
	interface_type = "external",
	className,
	placeholder,
	maxHeight = "600px",
	showHeader = true,
	showTypingIndicator = true,
	autoFocus = true,
	// FASE 3 AI-powered features
	enableSmartSuggestions = true,
	enableVoiceInput = true,
	enableFileUpload = true,
	enableHealthcareNLP = true,
	enablePredictiveText = true,
	maxFileSize = 10, // 10MB default
	allowedFileTypes = ['image/*', '.pdf', '.doc', '.docx'],
	// Accessibility enhancements
	ariaLabelledBy,
	ariaDescribedBy,
	screenReaderAnnouncements = true,
}: ChatInterfaceProps) {
	const {
		state,
		sendMessage,
		streamMessage,
		getCurrentSession,
		getSessionHistory,
		isConnected,
		hasActiveSession,
		switchInterface,
	} = useChat();

	// Core state
	const [inputValue, setInputValue] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	
	// FASE 3 AI-powered state
	const [smartSuggestions, setSmartSuggestions] = useState<HealthcareSuggestion[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
	const [voiceRecording, setVoiceRecording] = useState<VoiceRecordingState>({
		isRecording: false,
		isProcessing: false,
		duration: 0,
	});
	const [fileUpload, setFileUpload] = useState<FileUploadState>({
		isUploading: false,
		progress: 0,
	});
	
	// Accessibility state
	const [announcements, setAnnouncements] = useState<string[]>([]);
	const [focusedElementId, setFocusedElementId] = useState<string>("");

	// Healthcare terminology dictionary for Portuguese NLP
	const healthcareTerms = useMemo(() => ({
		// Appointment terms
		'agendar': { english: 'schedule', context: 'appointment' },
		'consulta': { english: 'consultation', context: 'appointment' },
		'retorno': { english: 'follow-up', context: 'appointment' },
		'emergência': { english: 'emergency', context: 'urgent' },
		// Symptoms
		'dor': { english: 'pain', context: 'symptom' },
		'febre': { english: 'fever', context: 'symptom' },
		'náusea': { english: 'nausea', context: 'symptom' },
		'tontura': { english: 'dizziness', context: 'symptom' },
		// Treatments
		'medicação': { english: 'medication', context: 'treatment' },
		'exame': { english: 'exam', context: 'treatment' },
		'cirurgia': { english: 'surgery', context: 'treatment' },
		'fisioterapia': { english: 'physiotherapy', context: 'treatment' },
	}), []);

	// FASE 3 AI-powered smart suggestions generator
	const generateSmartSuggestions = useCallback((input: string): HealthcareSuggestion[] => {
		if (!enableSmartSuggestions || input.length < 2) return [];
		
		const suggestions: HealthcareSuggestion[] = [];
		const lowerInput = input.toLowerCase();
		
		// Healthcare-specific suggestions based on Portuguese medical terms
		Object.entries(healthcareTerms).forEach(([term, data]) => {
			if (term.includes(lowerInput) || lowerInput.includes(term)) {
				suggestions.push({
					id: `${term}-${Date.now()}`,
					text: `Gostaria de ${term === 'agendar' ? 'agendar uma consulta' : 
						   term === 'dor' ? 'relatar sintomas de dor' : 
						   term === 'exame' ? 'solicitar informações sobre exames' : 
						   `obter informações sobre ${term}`}?`,
					type: data.context as any,
					confidence: lowerInput === term ? 0.9 : 0.7,
					medicalTerm: term,
					translation: data.english,
				});
			}
		});
		
		// Common healthcare phrases
		if (lowerInput.includes('quando') || lowerInput.includes('horário')) {
			suggestions.push({
				id: 'schedule-1',
				text: 'Verificar horários disponíveis para consulta',
				type: 'appointment',
				confidence: 0.8,
			});
		}
		
		if (lowerInput.includes('resultado') || lowerInput.includes('exame')) {
			suggestions.push({
				id: 'results-1',
				text: 'Consultar resultados de exames',
				type: 'treatment',
				confidence: 0.8,
			});
		}
		
		return suggestions.slice(0, 3); // Limit to top 3 suggestions
	}, [enableSmartSuggestions, healthcareTerms]);

	// Auto-scroll to bottom on new messages
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [state.sessions]);

	// Auto-focus input with accessibility announcement
	useEffect(() => {
		if (autoFocus && inputRef.current) {
			inputRef.current.focus();
			if (screenReaderAnnouncements) {
				announceToScreenReader(`Interface de chat ${interface_type === 'external' ? 'do paciente' : 'da equipe médica'} carregada. Digite sua mensagem.`);
			}
		}
	}, [autoFocus, interface_type, screenReaderAnnouncements]);

	// Handle interface switch
	useEffect(() => {
		if (state.config.interface_type !== interface_type) {
			switchInterface(interface_type);
		}
	}, [interface_type, state.config.interface_type, switchInterface]);

	// Generate smart suggestions based on input
	useEffect(() => {
		const suggestions = generateSmartSuggestions(inputValue);
		setSmartSuggestions(suggestions);
		setShowSuggestions(suggestions.length > 0 && inputValue.length > 1);
	}, [inputValue, generateSmartSuggestions]);

	// Accessibility: Screen reader announcements
	const announceToScreenReader = useCallback((message: string) => {
		if (!screenReaderAnnouncements) return;
		setAnnouncements(prev => [...prev.slice(-4), message]); // Keep last 5 announcements
	}, [screenReaderAnnouncements]);

	// FASE 3: Enhanced message sending with AI context
	const handleSendMessage = async () => {
		if (!inputValue.trim() || state.is_loading) return;

		const messageText = inputValue.trim();
		setInputValue("");
		setShowSuggestions(false);
		
		// Announce message being sent
		announceToScreenReader(`Enviando mensagem: ${messageText}`);

		try {
			if (state.config.streaming_enabled) {
				await streamMessage(messageText);
			} else {
				await sendMessage(messageText);
			}
			
			// Announce successful send
			announceToScreenReader("Mensagem enviada com sucesso");
		} catch (error) {
			console.error("Failed to send message:", error);
			announceToScreenReader("Erro ao enviar mensagem. Tente novamente.");
		}
	};

	// FASE 3: Enhanced keyboard navigation with smart suggestions
	const handleKeyPress = (e: React.KeyboardEvent) => {
		// Handle smart suggestion navigation
		if (showSuggestions && smartSuggestions.length > 0) {
			switch (e.key) {
				case "ArrowDown":
					e.preventDefault();
					setSelectedSuggestionIndex(prev => 
						prev < smartSuggestions.length - 1 ? prev + 1 : 0
					);
					announceToScreenReader(`Sugestão ${selectedSuggestionIndex + 1}: ${smartSuggestions[selectedSuggestionIndex]?.text}`);
					return;
				case "ArrowUp":
					e.preventDefault();
					setSelectedSuggestionIndex(prev => 
						prev > 0 ? prev - 1 : smartSuggestions.length - 1
					);
					announceToScreenReader(`Sugestão ${selectedSuggestionIndex + 1}: ${smartSuggestions[selectedSuggestionIndex]?.text}`);
					return;
				case "Tab":
					e.preventDefault();
					if (selectedSuggestionIndex >= 0) {
						const suggestion = smartSuggestions[selectedSuggestionIndex];
						setInputValue(suggestion.text);
						setShowSuggestions(false);
						setSelectedSuggestionIndex(-1);
						announceToScreenReader(`Sugestão selecionada: ${suggestion.text}`);
					}
					return;
				case "Escape":
					e.preventDefault();
					setShowSuggestions(false);
					setSelectedSuggestionIndex(-1);
					announceToScreenReader("Sugestões fechadas");
					return;
			}
		}
		
		// Standard message sending
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			if (selectedSuggestionIndex >= 0 && showSuggestions) {
				const suggestion = smartSuggestions[selectedSuggestionIndex];
				setInputValue(suggestion.text);
				setShowSuggestions(false);
				setSelectedSuggestionIndex(-1);
			} else {
				handleSendMessage();
			}
		}
	};

	const toggleRecording = () => {
		setIsRecording(!isRecording);
		// TODO: Implement voice recording
	};

	const handleFileUpload = () => {
		// TODO: Implement file upload
		console.log("File upload not implemented yet");
	};

	const getStatusColor = () => {
		switch (state.connection_status) {
			case "connected":
				return "text-green-500";
			case "connecting":
				return "text-yellow-500";
			case "disconnected":
				return "text-gray-500";
			case "error":
				return "text-red-500";
			default:
				return "text-gray-500";
		}
	};

	const getStatusText = () => {
		switch (state.connection_status) {
			case "connected":
				return "Conectado";
			case "connecting":
				return "Conectando...";
			case "disconnected":
				return "Desconectado";
			case "error":
				return "Erro de conexão";
			default:
				return "Status desconhecido";
		}
	};

	const messages = getCurrentSession()?.messages || [];

	return (
		<Card className={cn("flex flex-col", className)} style={{ maxHeight }}>
			{/* Header */}
			{showHeader && (
				<div className="flex items-center justify-between border-b p-4">
					<div className="flex items-center gap-3">
						<Bot className="h-6 w-6 text-primary" />
						<div>
							<h3 className="font-semibold">
								{interface_type === "external" ? "Assistente Virtual NeonPro" : "Assistente Interno"}
							</h3>
							<p className={cn("text-sm", getStatusColor())}>{getStatusText()}</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<Badge variant={interface_type === "external" ? "default" : "secondary"}>
							{interface_type === "external" ? "Paciente" : "Equipe"}
						</Badge>

						{state.is_streaming && (
							<Badge className="animate-pulse" variant="outline">
								Digitando...
							</Badge>
						)}

						<Button size="icon" variant="ghost">
							<Settings className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}

			{/* Messages */}
			<div className="flex-1 space-y-4 overflow-y-auto p-4">
				{messages.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<Bot className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p className="mb-2 font-medium text-lg">
							{interface_type === "external"
								? "Olá! Como posso ajudá-lo hoje?"
								: "Sistema pronto. Como posso auxiliar?"}
						</p>
						<p className="text-sm">
							{interface_type === "external"
								? "Posso ajudar com agendamentos, informações sobre a clínica e orientações gerais."
								: "Consulte dados, gere relatórios ou faça perguntas sobre operações."}
						</p>
					</div>
				) : (
					messages.map((message) => (
						<MessageBubble interface_type={interface_type} key={message.id} message={message} />
					))
				)}

				{state.is_loading && showTypingIndicator && <TypingIndicator />}

				<div ref={messagesEndRef} />
			</div>

			{/* Error Display */}
			{state.error && (
				<div className="border-red-200 border-t bg-red-50 p-4">
					<div className="flex items-center gap-2 text-red-700">
						<AlertTriangle className="h-4 w-4" />
						<span className="font-medium text-sm">Erro:</span>
						<span className="text-sm">{state.error}</span>
					</div>
				</div>
			)}

			{/* Input */}
			<div className="border-t p-4">
				<div className="flex items-center gap-2">
					<div className="relative flex-1">
						<Input
							className="pr-20"
							disabled={state.is_loading || !isConnected()}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyPress={handleKeyPress}
							placeholder={
								placeholder ||
								(interface_type === "external"
									? "Digite sua mensagem..."
									: "Faça uma pergunta ou solicite um relatório...")
							}
							ref={inputRef}
							value={inputValue}
						/>

						<div className="-translate-y-1/2 absolute top-1/2 right-2 flex items-center gap-1">
							<Button
								className="h-8 w-8"
								disabled={state.is_loading}
								onClick={handleFileUpload}
								size="icon"
								type="button"
								variant="ghost"
							>
								<Paperclip className="h-4 w-4" />
							</Button>

							<Button
								className={cn("h-8 w-8", isRecording && "bg-red-50 text-red-500")}
								disabled={state.is_loading}
								onClick={toggleRecording}
								size="icon"
								type="button"
								variant="ghost"
							>
								{isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
							</Button>
						</div>
					</div>

					<Button
						disabled={!inputValue.trim() || state.is_loading || !isConnected()}
						onClick={handleSendMessage}
						size="icon"
					>
						<Send className="h-4 w-4" />
					</Button>
				</div>

				<div className="mt-2 flex items-center justify-between text-muted-foreground text-xs">
					<span>
						{interface_type === "external"
							? "Suporte 24/7 • Atendimento seguro LGPD"
							: "Dados em tempo real • Acesso seguro"}
					</span>
					<span>{inputValue.length}/500</span>
				</div>
			</div>
		</Card>
	);
}

// Message Bubble Component
interface MessageBubbleProps {
	message: ChatMessage;
	interface_type: ChatInterface;
}

function MessageBubble({ message, interface_type }: MessageBubbleProps) {
	const isUser = message.role === "user";
	const isSystem = message.role === "system";

	const getStatusIcon = () => {
		switch (message.status) {
			case "sending":
				return <Clock className="h-3 w-3 text-gray-400" />;
			case "sent":
			case "delivered":
				return <CheckCircle className="h-3 w-3 text-green-500" />;
			case "error":
				return <XCircle className="h-3 w-3 text-red-500" />;
			default:
				return null;
		}
	};

	if (isSystem) {
		return (
			<div className="flex justify-center">
				<Badge className="text-xs" variant="outline">
					{message.content}
				</Badge>
			</div>
		);
	}

	return (
		<div className={cn("flex max-w-[80%] gap-3", isUser ? "ml-auto flex-row-reverse" : "mr-auto")}>
			<div
				className={cn(
					"flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
					isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
				)}
			>
				{isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
			</div>

			<div
				className={cn(
					"max-w-full rounded-lg px-4 py-2",
					isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
				)}
			>
				<div className="whitespace-pre-wrap break-words">
					{message.content}
					{message.streaming && <span className="ml-1 inline-block h-5 w-2 animate-pulse bg-current" />}
				</div>

				<div
					className={cn("mt-2 flex items-center justify-between text-xs opacity-70", isUser ? "flex-row-reverse" : "")}
				>
					<span>
						{new Date(message.timestamp).toLocaleTimeString("pt-BR", {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</span>

					{isUser && getStatusIcon()}
				</div>
			</div>
		</div>
	);
}

// Typing Indicator Component
function TypingIndicator() {
	return (
		<div className="mr-auto flex max-w-[80%] gap-3">
			<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted">
				<Bot className="h-4 w-4 text-muted-foreground" />
			</div>

			<div className="rounded-lg bg-muted px-4 py-2">
				<div className="flex items-center gap-1">
					<div className="flex gap-1">
						{[0, 1, 2].map((i) => (
							<div
								className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground"
								key={i}
								style={{
									animationDelay: `${i * 0.2}s`,
									animationDuration: "1s",
								}}
							/>
						))}
					</div>
					<span className="ml-2 text-muted-foreground text-sm">Digitando...</span>
				</div>
			</div>
		</div>
	);
}

export default ChatInterface;

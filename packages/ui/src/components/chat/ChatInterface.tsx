/**
 * Universal AI Chat Interface Component
 * Dual Interface: External Client + Internal Staff
 * Healthcare-optimized with Portuguese NLP
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
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface ChatInterfaceProps {
	interface_type?: ChatInterface;
	className?: string;
	placeholder?: string;
	maxHeight?: string;
	showHeader?: boolean;
	showTypingIndicator?: boolean;
	autoFocus?: boolean;
}

export function ChatInterface({
	interface_type = "external",
	className,
	placeholder,
	maxHeight = "600px",
	showHeader = true,
	showTypingIndicator = true,
	autoFocus = true,
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

	const [inputValue, setInputValue] = useState("");
	const [isRecording, setIsRecording] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Auto-scroll to bottom on new messages
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [state.sessions]);

	// Auto-focus input
	useEffect(() => {
		if (autoFocus && inputRef.current) {
			inputRef.current.focus();
		}
	}, [autoFocus]);

	// Handle interface switch
	useEffect(() => {
		if (state.config.interface_type !== interface_type) {
			switchInterface(interface_type);
		}
	}, [interface_type, state.config.interface_type, switchInterface]);

	const handleSendMessage = async () => {
		if (!inputValue.trim() || state.is_loading) return;

		const messageText = inputValue.trim();
		setInputValue("");

		try {
			if (state.config.streaming_enabled) {
				await streamMessage(messageText);
			} else {
				await sendMessage(messageText);
			}
		} catch (error) {
			console.error("Failed to send message:", error);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
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

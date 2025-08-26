"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useVoiceNavigation } from "@/hooks/use-voice-navigation";
import { cn } from "@/lib/utils";
import { Activity, Command, Mic, MicOff, Volume2 } from "lucide-react";
import { useState } from "react";

interface VoiceNavigationButtonProps {
	className?: string;
	size?: "sm" | "default" | "lg";
	variant?: "default" | "outline" | "ghost";
}

export function VoiceNavigationButton({
	className,
	size = "default",
	variant = "default",
}: VoiceNavigationButtonProps) {
	const [isCommandsOpen, setIsCommandsOpen] = useState(false);

	const {
		isListening,
		isProcessing,
		isSupported,
		lastCommand,
		confidence,
		error,
		toggleListening,
		availableCommands,
		getCommandsByCategory,
		speak,
	} = useVoiceNavigation();

	if (!isSupported) {
		return null;
	}

	const handleVoiceToggle = async () => {
		try {
			await toggleListening();
		} catch (error) {
			console.error("Voice navigation error:", error);
			speak("Erro ao ativar reconhecimento de voz");
		}
	};

	const navigationCommands = getCommandsByCategory("navigation");
	const patientCommands = getCommandsByCategory("patient");
	const appointmentCommands = getCommandsByCategory("appointment");
	const inventoryCommands = getCommandsByCategory("inventory");
	const emergencyCommands = getCommandsByCategory("emergency");

	return (
		<div className={cn("flex items-center gap-2", className)}>
			{/* Main Voice Button */}
			<Button
				variant={isListening ? "default" : variant}
				size={size}
				onClick={handleVoiceToggle}
				disabled={isProcessing}
				className={cn(
					"relative",
					isListening && "bg-red-500 hover:bg-red-600 text-white",
					isProcessing && "animate-pulse"
				)}
			>
				{isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}

				{isListening && <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-400 rounded-full animate-ping" />}
			</Button>

			{/* Commands Help */}
			<Popover open={isCommandsOpen} onOpenChange={setIsCommandsOpen}>
				<PopoverTrigger asChild>
					<Button variant="ghost" size="sm">
						<Command className="h-4 w-4" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-80" align="end">
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h4 className="text-sm font-medium">Comandos de Voz</h4>
							<Badge variant={isListening ? "default" : "outline"}>{isListening ? "Ouvindo" : "Inativo"}</Badge>
						</div>

						{/* Status */}
						{lastCommand && (
							<div className="text-xs text-muted-foreground">
								<p>Último comando: "{lastCommand}"</p>
								{confidence > 0 && <p>Confiança: {Math.round(confidence * 100)}%</p>}
							</div>
						)}

						{error && <div className="text-xs text-red-500 bg-red-50 p-2 rounded">{error}</div>}

						{/* Commands by Category */}
						<div className="space-y-3 max-h-64 overflow-y-auto">
							{navigationCommands.length > 0 && (
								<div>
									<h5 className="text-xs font-medium text-blue-600 mb-2">Navegação</h5>
									<ul className="space-y-1 text-xs text-muted-foreground">
										{navigationCommands.map((cmd) => (
											<li key={cmd.id}>• {cmd.description}</li>
										))}
									</ul>
								</div>
							)}

							{patientCommands.length > 0 && (
								<div>
									<h5 className="text-xs font-medium text-green-600 mb-2">Pacientes</h5>
									<ul className="space-y-1 text-xs text-muted-foreground">
										{patientCommands.map((cmd) => (
											<li key={cmd.id}>• {cmd.description}</li>
										))}
									</ul>
								</div>
							)}

							{appointmentCommands.length > 0 && (
								<div>
									<h5 className="text-xs font-medium text-purple-600 mb-2">Agenda</h5>
									<ul className="space-y-1 text-xs text-muted-foreground">
										{appointmentCommands.map((cmd) => (
											<li key={cmd.id}>• {cmd.description}</li>
										))}
									</ul>
								</div>
							)}

							{inventoryCommands.length > 0 && (
								<div>
									<h5 className="text-xs font-medium text-orange-600 mb-2">Estoque</h5>
									<ul className="space-y-1 text-xs text-muted-foreground">
										{inventoryCommands.map((cmd) => (
											<li key={cmd.id}>• {cmd.description}</li>
										))}
									</ul>
								</div>
							)}

							{emergencyCommands.length > 0 && (
								<div>
									<h5 className="text-xs font-medium text-red-600 mb-2">Emergência</h5>
									<ul className="space-y-1 text-xs text-muted-foreground">
										{emergencyCommands.map((cmd) => (
											<li key={cmd.id}>• {cmd.description}</li>
										))}
									</ul>
								</div>
							)}
						</div>

						{/* Test Voice */}
						<Button
							variant="outline"
							size="sm"
							onClick={() => speak("Sistema de voz funcionando corretamente")}
							className="w-full"
						>
							<Volume2 className="h-3 w-3 mr-2" />
							Testar Voz
						</Button>
					</div>
				</PopoverContent>
			</Popover>

			{/* Activity Indicator */}
			{isProcessing && (
				<div className="flex items-center text-xs text-muted-foreground">
					<Activity className="h-3 w-3 mr-1 animate-spin" />
					Processando...
				</div>
			)}
		</div>
	);
}

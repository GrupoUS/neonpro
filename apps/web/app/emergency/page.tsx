"use client";

import {
	Activity,
	AlertTriangle,
	Calendar,
	Clock,
	Heart,
	Mic,
	MicIcon,
	Phone,
	Pill,
	QrCode,
	Scan,
	Search,
	Shield,
	User,
	Wifi,
	WifiOff,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

// Emergency patient interface for critical medical information
interface EmergencyPatient {
	id: string;
	name: string;
	cpf: string;
	rg: string;
	birthDate: string;
	phone: string;
	allergies: Array<{
		type: string;
		severity: "critical" | "high" | "moderate";
		description: string;
	}>;
	medications: Array<{
		name: string;
		dosage: string;
		frequency: string;
		lastTaken?: string;
	}>;
	contraindications: Array<{
		type: string;
		description: string;
		severity: "high" | "moderate" | "low";
	}>;
	emergencyContacts: Array<{
		name: string;
		relationship: string;
		phone: string;
		isPrimary: boolean;
	}>;
	medicalConditions: Array<{
		condition: string;
		status: "active" | "controlled" | "resolved";
		lastUpdate: string;
	}>;
	lastAccessed: string;
}

// Emergency interface state
interface EmergencyState {
	isOnline: boolean;
	cacheStatus: "fresh" | "stale" | "offline";
	lastSync: string;
	searchQuery: string;
	selectedPatient: EmergencyPatient | null;
	recentPatients: EmergencyPatient[];
	isSearching: boolean;
	voiceActive: boolean;
	scannerActive: boolean;
}

// Emergency search bar component
const EmergencySearchBar: React.FC<{
	value: string;
	onChange: (value: string) => void;
	onVoiceToggle: () => void;
	onScannerToggle: () => void;
	isVoiceActive: boolean;
	isScannerActive: boolean;
	isSearching: boolean;
}> = ({ value, onChange, onVoiceToggle, onScannerToggle, isVoiceActive, isScannerActive, isSearching }) => {
	const inputRef = useRef<HTMLInputElement>(null);

	// Focus management for accessibility
	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, []);

	return (
		<Card className="border-2 border-red-200 bg-white shadow-lg">
			<CardHeader className="pb-4">
				<CardTitle className="flex items-center gap-2 font-bold text-red-600 text-xl">
					<AlertTriangle className="h-6 w-6" />
					Busca de Emergência
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex gap-2">
					<div className="relative flex-1">
						<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-5 w-5 transform text-muted-foreground" />
						<Input
							aria-describedby="search-help"
							aria-label="Campo de busca de emergência para pacientes"
							className="h-14 border-2 pl-10 text-lg focus:border-red-500"
							disabled={isSearching}
							onChange={(e) => onChange(e.target.value)}
							placeholder="Buscar paciente por nome, CPF ou RG..."
							ref={inputRef}
							type="text"
							value={value}
						/>
						{isSearching && (
							<div className="-translate-y-1/2 absolute top-1/2 right-3 transform">
								<div className="h-5 w-5 animate-spin rounded-full border-red-500 border-b-2" />
							</div>
						)}
					</div>

					{/* Voice Command Button */}
					<Button
						aria-label={isVoiceActive ? "Desativar comando de voz" : "Ativar comando de voz"}
						aria-pressed={isVoiceActive}
						className="h-14 border-2 px-6"
						onClick={onVoiceToggle}
						size="lg"
						variant={isVoiceActive ? "destructive" : "outline"}
					>
						<MicIcon className="mr-2 h-5 w-5" />
						{isVoiceActive ? "Ouvindo..." : "Voz"}
					</Button>

					{/* Barcode Scanner Button */}
					<Button
						aria-label={isScannerActive ? "Fechar scanner" : "Abrir scanner de código"}
						aria-pressed={isScannerActive}
						className="h-14 border-2 px-6"
						onClick={onScannerToggle}
						size="lg"
						variant={isScannerActive ? "destructive" : "outline"}
					>
						<QrCode className="mr-2 h-5 w-5" />
						Scanner
					</Button>
				</div>

				<div className="text-muted-foreground text-sm" id="search-help">
					Digite o nome, CPF ou RG do paciente. Use voz ou scanner para entrada alternativa.
				</div>
			</CardContent>
		</Card>
	);
};

// Critical patient information display
const PatientCriticalInfo: React.FC<{
	patient: EmergencyPatient;
}> = ({ patient }) => {
	return (
		<div className="space-y-4">
			{/* Patient Header */}
			<Card className="border-2 border-blue-200">
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<CardTitle className="font-bold text-foreground text-xl">{patient.name}</CardTitle>
						<Badge className="text-sm" variant="outline">
							ID: {patient.id}
						</Badge>
					</div>
					<div className="space-x-4 text-muted-foreground text-sm">
						<span>CPF: {patient.cpf}</span>
						<span>•</span>
						<span>RG: {patient.rg}</span>
						<span>•</span>
						<span>Nascimento: {patient.birthDate}</span>
					</div>
				</CardHeader>
			</Card>

			{/* Critical Allergies - RED ALERT */}
			<Card className="border-2 border-red-500 bg-red-50">
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 font-bold text-lg text-red-700">
						<AlertTriangle className="h-5 w-5" />🔴 ALERGIAS CRÍTICAS
					</CardTitle>
				</CardHeader>
				<CardContent>
					{patient.allergies.length > 0 ? (
						<div className="space-y-2">
							{patient.allergies.map((allergy, index) => (
								<Alert className="border-red-400 bg-red-100" key={index}>
									<AlertTriangle className="h-4 w-4 text-red-600" />
									<AlertDescription className="font-medium text-red-800">
										<span className="font-bold">{allergy.type}</span>
										{allergy.severity === "critical" && (
											<Badge className="ml-2" variant="destructive">
												CRÍTICA
											</Badge>
										)}
										<br />
										{allergy.description}
									</AlertDescription>
								</Alert>
							))}
						</div>
					) : (
						<p className="text-red-600">Nenhuma alergia registrada</p>
					)}
				</CardContent>
			</Card>

			{/* Current Medications - ORANGE */}
			<Card className="border-2 border-orange-500 bg-orange-50">
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 font-bold text-lg text-orange-700">
						<Pill className="h-5 w-5" />🟠 MEDICAÇÕES ATUAIS
					</CardTitle>
				</CardHeader>
				<CardContent>
					{patient.medications.length > 0 ? (
						<div className="grid gap-3 md:grid-cols-2">
							{patient.medications.map((medication, index) => (
								<div className="rounded-lg border border-orange-300 bg-orange-100 p-3" key={index}>
									<div className="font-bold text-orange-800">{medication.name}</div>
									<div className="text-orange-700 text-sm">Dosagem: {medication.dosage}</div>
									<div className="text-orange-700 text-sm">Frequência: {medication.frequency}</div>
									{medication.lastTaken && (
										<div className="mt-1 text-orange-600 text-xs">Última dose: {medication.lastTaken}</div>
									)}
								</div>
							))}
						</div>
					) : (
						<p className="text-orange-600">Nenhuma medicação registrada</p>
					)}
				</CardContent>
			</Card>

			{/* Medical Cautions - YELLOW */}
			<Card className="border-2 border-accent bg-accent/10">
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 font-bold text-accent text-lg">
						<Shield className="h-5 w-5" />🟡 CONTRAINDICAÇÕES
					</CardTitle>
				</CardHeader>
				<CardContent>
					{patient.contraindications.length > 0 ? (
						<div className="space-y-2">
							{patient.contraindications.map((contraindication, index) => (
								<div className="rounded-lg border border-accent/30 bg-accent/20 p-3" key={index}>
									<div className="font-bold text-accent">{contraindication.type}</div>
									<div className="text-accent text-sm">{contraindication.description}</div>
									<Badge className="mt-1" variant={contraindication.severity === "high" ? "destructive" : "secondary"}>
										{contraindication.severity === "high"
											? "Alta"
											: contraindication.severity === "moderate"
												? "Moderada"
												: "Baixa"}
									</Badge>
								</div>
							))}
						</div>
					) : (
						<p className="text-accent">Nenhuma contraindicação registrada</p>
					)}
				</CardContent>
			</Card>

			{/* Medical Conditions */}
			<Card className="border-2 border-green-200 bg-green-50">
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 font-bold text-green-700 text-lg">
						<Heart className="h-5 w-5" />🩺 CONDIÇÕES MÉDICAS
					</CardTitle>
				</CardHeader>
				<CardContent>
					{patient.medicalConditions.length > 0 ? (
						<div className="grid gap-2 md:grid-cols-2">
							{patient.medicalConditions.map((condition, index) => (
								<div className="rounded-lg border border-green-300 bg-green-100 p-3" key={index}>
									<div className="font-bold text-green-800">{condition.condition}</div>
									<Badge
										className="mt-1"
										variant={
											condition.status === "active"
												? "destructive"
												: condition.status === "controlled"
													? "secondary"
													: "outline"
										}
									>
										{condition.status === "active"
											? "Ativa"
											: condition.status === "controlled"
												? "Controlada"
												: "Resolvida"}
									</Badge>
									<div className="mt-1 text-green-600 text-xs">Atualização: {condition.lastUpdate}</div>
								</div>
							))}
						</div>
					) : (
						<p className="text-green-600">Nenhuma condição médica registrada</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

// Emergency contacts component
const EmergencyContacts: React.FC<{
	contacts: EmergencyPatient["emergencyContacts"];
}> = ({ contacts }) => {
	const handleCall = useCallback((phoneNumber: string, contactName: string) => {
		// In a real implementation, this would trigger the phone call
		if (confirm(`Ligar para ${contactName} (${phoneNumber})?`)) {
			// Emergency audit log
			console.log(`Emergency call initiated to ${contactName} at ${phoneNumber} at ${new Date().toISOString()}`);

			// Attempt to use tel: protocol
			window.open(`tel:${phoneNumber}`, "_self");
		}
	}, []);

	return (
		<Card className="border-2 border-blue-200">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 font-bold text-blue-700 text-lg">
					<Phone className="h-5 w-5" />📞 CONTATOS DE EMERGÊNCIA
				</CardTitle>
			</CardHeader>
			<CardContent>
				{contacts.length > 0 ? (
					<div className="space-y-3">
						{contacts.map((contact, index) => (
							<div
								className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-3"
								key={index}
							>
								<div className="flex-1">
									<div className="flex items-center gap-2 font-bold text-blue-800">
										{contact.name}
										{contact.isPrimary && (
											<Badge className="bg-blue-600" variant="default">
												PRINCIPAL
											</Badge>
										)}
									</div>
									<div className="text-blue-700 text-sm">{contact.relationship}</div>
									<div className="font-mono text-blue-600 text-sm">{contact.phone}</div>
								</div>
								<Button
									aria-label={`Ligar para ${contact.name}`}
									className="h-12 bg-green-600 px-6 text-white hover:bg-green-700"
									onClick={() => handleCall(contact.phone, contact.name)}
									size="lg"
								>
									<Phone className="mr-2 h-5 w-5" />
									Ligar
								</Button>
							</div>
						))}
					</div>
				) : (
					<p className="text-blue-600">Nenhum contato de emergência registrado</p>
				)}
			</CardContent>
		</Card>
	);
};

// Crisis scheduler component
const CrisisScheduler: React.FC = () => {
	const [availableDoctors] = useState([
		{
			id: "1",
			name: "Dr. Ana Silva",
			specialty: "Emergência",
			available: true,
			nextSlot: "10:30",
		},
		{
			id: "2",
			name: "Dr. Carlos Santos",
			specialty: "Cardiologia",
			available: true,
			nextSlot: "11:00",
		},
		{
			id: "3",
			name: "Dra. Maria Costa",
			specialty: "Neurologia",
			available: false,
			nextSlot: "14:30",
		},
	]);

	const handleEmergencyBooking = useCallback((doctorId: string, doctorName: string) => {
		if (confirm(`Confirmar agendamento de emergência com ${doctorName}?`)) {
			console.log(`Emergency appointment booked with ${doctorName} at ${new Date().toISOString()}`);
			alert(`Agendamento de emergência confirmado com ${doctorName}`);
		}
	}, []);

	return (
		<Card className="border-2 border-purple-200">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 font-bold text-lg text-purple-700">
					<Calendar className="h-5 w-5" />
					Agendamento de Emergência
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{availableDoctors.map((doctor) => (
						<div
							className="flex items-center justify-between rounded-lg border border-purple-200 bg-purple-50 p-3"
							key={doctor.id}
						>
							<div className="flex-1">
								<div className="font-bold text-purple-800">{doctor.name}</div>
								<div className="text-purple-700 text-sm">{doctor.specialty}</div>
								<div className="text-purple-600 text-sm">Próximo horário: {doctor.nextSlot}</div>
							</div>
							<div className="flex items-center gap-3">
								<Badge
									className={doctor.available ? "bg-green-600" : "bg-gray-500"}
									variant={doctor.available ? "default" : "secondary"}
								>
									{doctor.available ? "Disponível" : "Ocupado"}
								</Badge>
								<Button
									aria-label={`Agendar emergência com ${doctor.name}`}
									className="bg-red-600 text-white hover:bg-red-700"
									disabled={!doctor.available}
									onClick={() => handleEmergencyBooking(doctor.id, doctor.name)}
									size="sm"
								>
									Agendar
								</Button>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
};

// Offline indicator component
const OfflineIndicator: React.FC<{
	isOnline: boolean;
	cacheStatus: "fresh" | "stale" | "offline";
	lastSync: string;
}> = ({ isOnline, cacheStatus, lastSync }) => {
	const getStatusColor = () => {
		if (!isOnline) return "text-red-600 bg-red-50 border-red-200";
		if (cacheStatus === "stale") return "text-accent bg-accent/10 border-accent/20";
		return "text-green-600 bg-green-50 border-green-200";
	};

	const getStatusText = () => {
		if (!isOnline) return "Modo Offline - Dados em Cache";
		if (cacheStatus === "stale") return "Dados Podem Estar Desatualizados";
		return "Sistema Online - Dados Atualizados";
	};

	return (
		<Card className={`border-2 ${getStatusColor()}`}>
			<CardContent className="p-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						{isOnline ? <Wifi className="h-5 w-5 text-green-600" /> : <WifiOff className="h-5 w-5 text-red-600" />}
						<span className="font-medium">{getStatusText()}</span>
					</div>
					<div className="text-sm">Última sincronização: {lastSync}</div>
				</div>
			</CardContent>
		</Card>
	);
};

// Main Emergency Access Page Component
export default function EmergencyAccessPage() {
	const [state, setState] = useState<EmergencyState>({
		isOnline: navigator.onLine,
		cacheStatus: "fresh",
		lastSync: new Date().toLocaleString("pt-BR"),
		searchQuery: "",
		selectedPatient: null,
		recentPatients: [],
		isSearching: false,
		voiceActive: false,
		scannerActive: false,
	});

	// Mock patient data for demonstration
	const mockPatient: EmergencyPatient = {
		id: "PAT-2024-001",
		name: "João Silva Santos",
		cpf: "123.456.789-00",
		rg: "12.345.678-9",
		birthDate: "15/03/1980",
		phone: "(11) 99999-9999",
		allergies: [
			{
				type: "Penicilina",
				severity: "critical",
				description: "Reação anafilática grave - usar epinefrina imediatamente",
			},
			{
				type: "Látex",
				severity: "high",
				description: "Dermatite de contato severa",
			},
		],
		medications: [
			{
				name: "Losartana",
				dosage: "50mg",
				frequency: "1x ao dia",
				lastTaken: "Hoje 08:00",
			},
			{
				name: "Sinvastatina",
				dosage: "20mg",
				frequency: "1x ao dia (noite)",
				lastTaken: "Ontem 22:00",
			},
		],
		contraindications: [
			{
				type: "Aspirina",
				description: "Histórico de sangramento gastrointestinal",
				severity: "high",
			},
		],
		emergencyContacts: [
			{
				name: "Maria Silva Santos",
				relationship: "Esposa",
				phone: "(11) 88888-8888",
				isPrimary: true,
			},
			{
				name: "Pedro Silva Santos",
				relationship: "Filho",
				phone: "(11) 77777-7777",
				isPrimary: false,
			},
		],
		medicalConditions: [
			{
				condition: "Hipertensão Arterial",
				status: "controlled",
				lastUpdate: "10/01/2024",
			},
			{
				condition: "Dislipidemia",
				status: "controlled",
				lastUpdate: "10/01/2024",
			},
		],
		lastAccessed: new Date().toISOString(),
	};

	// Handle online status changes
	useEffect(() => {
		const handleOnlineStatusChange = () => {
			setState((prev) => ({
				...prev,
				isOnline: navigator.onLine,
				cacheStatus: navigator.onLine ? "fresh" : "offline",
				lastSync: navigator.onLine ? new Date().toLocaleString("pt-BR") : prev.lastSync,
			}));
		};

		window.addEventListener("online", handleOnlineStatusChange);
		window.addEventListener("offline", handleOnlineStatusChange);

		return () => {
			window.removeEventListener("online", handleOnlineStatusChange);
			window.removeEventListener("offline", handleOnlineStatusChange);
		};
	}, []);

	// Handle search
	const handleSearch = useCallback(async (query: string) => {
		setState((prev) => ({ ...prev, searchQuery: query, isSearching: true }));

		// Simulate search delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Mock search - in real implementation, this would search the database
		if (query.toLowerCase().includes("joão") || query.includes("123.456.789-00")) {
			setState((prev) => ({
				...prev,
				selectedPatient: mockPatient,
				isSearching: false,
			}));
		} else if (query.length > 0) {
			setState((prev) => ({
				...prev,
				selectedPatient: null,
				isSearching: false,
			}));
			alert("Paciente não encontrado. Verifique o nome, CPF ou RG informado.");
		} else {
			setState((prev) => ({
				...prev,
				selectedPatient: null,
				isSearching: false,
			}));
		}
	}, []);

	// Handle voice toggle
	const handleVoiceToggle = useCallback(() => {
		setState((prev) => ({
			...prev,
			voiceActive: !prev.voiceActive,
			scannerActive: false, // Close scanner when opening voice
		}));

		// In real implementation, this would start/stop voice recognition
		if (!state.voiceActive) {
			console.log("Voice recognition started");
			// Simulate voice recognition after 3 seconds
			setTimeout(() => {
				handleSearch("João Silva");
				setState((prev) => ({ ...prev, voiceActive: false }));
			}, 3000);
		}
	}, [state.voiceActive, handleSearch]);

	// Handle scanner toggle
	const handleScannerToggle = useCallback(() => {
		setState((prev) => ({
			...prev,
			scannerActive: !prev.scannerActive,
			voiceActive: false, // Close voice when opening scanner
		}));

		// In real implementation, this would start/stop barcode scanner
		if (!state.scannerActive) {
			console.log("Barcode scanner started");
			// Simulate barcode scan after 2 seconds
			setTimeout(() => {
				handleSearch("123.456.789-00");
				setState((prev) => ({ ...prev, scannerActive: false }));
			}, 2000);
		}
	}, [state.scannerActive, handleSearch]);

	// Keyboard shortcuts for emergency actions
	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			// Ctrl+S for search focus
			if (event.ctrlKey && event.key === "s") {
				event.preventDefault();
				const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
				if (searchInput) {
					searchInput.focus();
				}
			}

			// Ctrl+V for voice
			if (event.ctrlKey && event.key === "v") {
				event.preventDefault();
				handleVoiceToggle();
			}

			// Ctrl+B for barcode
			if (event.ctrlKey && event.key === "b") {
				event.preventDefault();
				handleScannerToggle();
			}
		};

		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, [handleVoiceToggle, handleScannerToggle]);

	return (
		<div className="min-h-screen bg-bg-secondary/30 p-4" lang="pt-BR">
			<div className="mx-auto max-w-6xl space-y-6">
				{/* Emergency Header */}
				<div className="rounded-lg bg-red-600 py-6 text-center text-white shadow-lg">
					<h1 className="flex items-center justify-center gap-3 font-bold font-serif text-4xl">
						<AlertTriangle className="h-8 w-8" />
						Acesso de Emergência
					</h1>
					<p className="mt-2 text-xl opacity-90">Sistema de Acesso Rápido a Informações Críticas de Pacientes</p>
				</div>

				{/* System Status */}
				<OfflineIndicator cacheStatus={state.cacheStatus} isOnline={state.isOnline} lastSync={state.lastSync} />

				{/* Emergency Search */}
				<EmergencySearchBar
					isScannerActive={state.scannerActive}
					isSearching={state.isSearching}
					isVoiceActive={state.voiceActive}
					onChange={(value) => setState((prev) => ({ ...prev, searchQuery: value }))}
					onScannerToggle={handleScannerToggle}
					onVoiceToggle={handleVoiceToggle}
					value={state.searchQuery}
				/>

				{/* Voice/Scanner Active Indicators */}
				{state.voiceActive && (
					<Alert className="border-blue-400 bg-blue-50">
						<Mic className="h-4 w-4 text-blue-600" />
						<AlertDescription className="text-blue-800">
							<strong>Comando de voz ativo.</strong> Diga o nome do paciente, CPF ou RG.
						</AlertDescription>
					</Alert>
				)}

				{state.scannerActive && (
					<Alert className="border-purple-400 bg-purple-50">
						<Scan className="h-4 w-4 text-purple-600" />
						<AlertDescription className="text-purple-800">
							<strong>Scanner ativo.</strong> Posicione o código de barras ou QR code do paciente.
						</AlertDescription>
					</Alert>
				)}

				{/* Search Button */}
				{state.searchQuery && (
					<div className="flex justify-center">
						<Button
							className="h-12 bg-red-600 px-8 text-lg text-white hover:bg-red-700"
							disabled={state.isSearching}
							onClick={() => handleSearch(state.searchQuery)}
							size="lg"
						>
							{state.isSearching ? (
								<>
									<div className="mr-2 h-5 w-5 animate-spin rounded-full border-white border-b-2" />
									Buscando...
								</>
							) : (
								<>
									<Search className="mr-2 h-5 w-5" />
									Buscar Paciente
								</>
							)}
						</Button>
					</div>
				)}

				{/* Patient Information */}
				{state.selectedPatient && (
					<>
						<Separator />

						<div className="grid gap-6 lg:grid-cols-3">
							{/* Critical Patient Info - 2 columns */}
							<div className="lg:col-span-2">
								<PatientCriticalInfo patient={state.selectedPatient} />
							</div>

							{/* Emergency Actions - 1 column */}
							<div className="space-y-4">
								<EmergencyContacts contacts={state.selectedPatient.emergencyContacts} />
								<CrisisScheduler />
							</div>
						</div>
					</>
				)}

				{/* Emergency Instructions */}
				{!(state.selectedPatient || state.searchQuery) && (
					<Card className="border-2 border-gray-200">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 font-bold text-foreground text-xl">
								<Activity className="h-6 w-6" />
								Instruções de Emergência
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2">
								<div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
									<h3 className="mb-2 font-bold text-blue-800">Busca Rápida</h3>
									<ul className="space-y-1 text-blue-700 text-sm">
										<li>• Digite nome, CPF ou RG</li>
										<li>• Use comando de voz (Ctrl+V)</li>
										<li>• Scanner de código (Ctrl+B)</li>
										<li>• Foco na busca (Ctrl+S)</li>
									</ul>
								</div>

								<div className="rounded-lg border border-green-200 bg-green-50 p-4">
									<h3 className="mb-2 font-bold text-green-800">Informações Críticas</h3>
									<ul className="space-y-1 text-green-700 text-sm">
										<li>• 🔴 Alergias life-threatening</li>
										<li>• 🟠 Medicações atuais</li>
										<li>• 🟡 Contraindicações</li>
										<li>• 📞 Contatos de emergência</li>
									</ul>
								</div>
							</div>

							<Alert className="border-orange-400 bg-orange-50">
								<Shield className="h-4 w-4 text-orange-600" />
								<AlertDescription className="text-orange-800">
									<strong>Protocolo de Emergência:</strong> Todos os acessos são registrados para auditoria. Em caso de
									falha do sistema, consulte os protocolos em papel disponíveis na recepção.
								</AlertDescription>
							</Alert>
						</CardContent>
					</Card>
				)}

				{/* Emergency Footer */}
				<div className="border-t py-4 text-center text-muted-foreground text-sm">
					<p>
						NeonPro Healthcare Emergency Access • Versão 1.0 •
						<span className="font-mono"> {new Date().toLocaleString("pt-BR")}</span>
					</p>
					<p className="mt-1">🔒 Acesso monitorado e auditado conforme LGPD • ☎️ Suporte 24h: 0800-NEONPRO</p>
				</div>
			</div>
		</div>
	);
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { EmergencyAlert, PatientInfo } from "../types";

type EmergencyAccessProps = {
	onPatientSelect: (patientId: string) => void;
	onEmergencySearch: (query: string) => Promise<PatientInfo[]>;
	emergencyAlerts?: EmergencyAlert[];
	className?: string;
};

export function EmergencyAccessInterface({
	onPatientSelect,
	onEmergencySearch,
	emergencyAlerts = [],
	className = "",
}: EmergencyAccessProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<PatientInfo[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [searchStartTime, setSearchStartTime] = useState<number | null>(null);
	const [responseTime, setResponseTime] = useState<number | null>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);

	// Auto-focus on mount for fastest access
	useEffect(() => {
		if (searchInputRef.current) {
			searchInputRef.current.focus();
		}
	}, []);

	// Debounced search with 10s target performance
	const performSearch = useCallback(
		async (query: string) => {
			if (!query.trim() || query.length < 3) {
				setSearchResults([]);
				return;
			}

			setIsSearching(true);
			setSearchStartTime(Date.now());

			try {
				const results = await onEmergencySearch(query);
				setSearchResults(results);

				if (searchStartTime) {
					const elapsed = Date.now() - searchStartTime;
					setResponseTime(elapsed);

					// Log performance warning if >5s (half of target)
					if (elapsed > 5000) {
					}
				}
			} catch (_error) {
				setSearchResults([]);
			} finally {
				setIsSearching(false);
			}
		},
		[onEmergencySearch, searchStartTime]
	);

	// Immediate search on input (no debounce for emergency)
	useEffect(() => {
		performSearch(searchQuery);
	}, [searchQuery, performSearch]);

	const handleQuickSelect = (patientId: string) => {
		onPatientSelect(patientId);

		// Track emergency access time
		if (searchStartTime) {
			const _totalTime = Date.now() - searchStartTime;
		}
	};

	// Keyboard shortcuts for fast navigation
	const handleKeyPress = (event: React.KeyboardEvent) => {
		if (event.key === "Enter" && searchResults.length === 1) {
			handleQuickSelect(searchResults[0].id);
		}

		if (event.key === "Escape") {
			setSearchQuery("");
			setSearchResults([]);
		}
	};

	return (
		<div className={`emergency-access rounded-lg border-2 border-red-500 bg-white shadow-xl ${className}`}>
			{/* Emergency Header */}
			<div className="rounded-t-lg bg-red-500 p-4 text-white">
				<div className="flex items-center justify-between">
					<div className="flex items-center">
						<span className="mr-2 text-2xl">🚨</span>
						<h2 className="font-bold text-xl">ACESSO DE EMERGÊNCIA</h2>
					</div>
					{responseTime && (
						<div
							className={`rounded px-2 py-1 text-sm ${
								responseTime < 5000 ? "bg-green-500" : responseTime < 10_000 ? "bg-yellow-500" : "bg-red-600"
							}`}
						>
							{responseTime}ms
						</div>
					)}
				</div>
				<p className="mt-1 text-red-100 text-sm">Busca rápida de pacientes • Meta: {"<10s"}</p>
			</div>{" "}
			{/* Active Alerts */}
			{emergencyAlerts.length > 0 && (
				<div className="border-red-200 border-b bg-red-50 p-3">
					<h3 className="mb-2 font-semibold text-red-800 text-sm">ALERTAS ATIVOS</h3>
					<div className="space-y-1">
						{emergencyAlerts.slice(0, 3).map((alert) => (
							<div
								className="flex cursor-pointer items-center text-red-700 text-sm hover:text-red-900"
								key={alert.id}
								onClick={() => alert.patientId && handleQuickSelect(alert.patientId)}
							>
								<span className="mr-2">{alert.type === "critical" ? "🔴" : alert.type === "high" ? "🟠" : "🟡"}</span>
								<span className="truncate">
									{alert.roomNumber && `Quarto ${alert.roomNumber} • `}
									{alert.message}
								</span>
							</div>
						))}
					</div>
				</div>
			)}
			{/* Search Interface */}
			<div className="p-4">
				<div className="relative">
					<input
						aria-label="Busca de emergência de paciente"
						autoComplete="off"
						className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-lg outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
						onChange={(e) => setSearchQuery(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder="CPF, SUS, Nome ou Quarto do paciente..."
						ref={searchInputRef}
						spellCheck={false}
						type="text"
						value={searchQuery}
					/>

					{isSearching && (
						<div className="-translate-y-1/2 absolute top-1/2 right-3 transform">
							<div className="h-6 w-6 animate-spin rounded-full border-red-500 border-b-2" />
						</div>
					)}
				</div>

				{/* Quick Access Hint */}
				<div className="mt-2 flex items-center text-gray-600 text-xs">
					<span>💡 Digite qualquer parte do nome, CPF ou número do quarto</span>
					{searchResults.length === 1 && (
						<span className="ml-2 font-medium text-green-600">• ENTER para selecionar</span>
					)}
				</div>

				{/* Search Results */}
				{searchResults.length > 0 && (
					<div className="mt-4 max-h-96 overflow-y-auto">
						<h3 className="mb-2 font-semibold text-gray-700 text-sm">RESULTADOS ({searchResults.length})</h3>
						<div className="space-y-2">
							{searchResults.map((patient, index) => (
								<div
									className={`cursor-pointer rounded-lg border p-3 transition-all duration-150 hover:shadow-md ${
										index === 0 ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-red-300"
									}`}
									key={patient.id}
									onClick={() => handleQuickSelect(patient.id)}
									onKeyPress={(e) => e.key === "Enter" && handleQuickSelect(patient.id)}
									role="button"
									tabIndex={0}
								>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<div className="font-semibold text-gray-900">{patient.name}</div>
											<div className="mt-1 text-gray-600 text-sm">
												<span>CPF: {patient.cpf}</span>
												{patient.sus && <span className="ml-3">SUS: {patient.sus}</span>}
											</div>
											<div className="mt-1 text-gray-500 text-sm">
												Tel: {patient.phone} • {new Date().getFullYear() - new Date(patient.birthDate).getFullYear()}{" "}
												anos
											</div>
										</div>
										<div className="text-right">
											{index === 0 && <div className="rounded bg-red-500 px-2 py-1 text-white text-xs">PRIMEIRO</div>}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* No Results */}
				{searchQuery.length >= 3 && !isSearching && searchResults.length === 0 && (
					<div className="mt-4 py-8 text-center text-gray-500">
						<span className="mb-2 block text-2xl">🔍</span>
						<p>Nenhum paciente encontrado</p>
						<p className="mt-1 text-sm">Verifique CPF, SUS ou nome completo</p>
					</div>
				)}
			</div>
		</div>
	);
}

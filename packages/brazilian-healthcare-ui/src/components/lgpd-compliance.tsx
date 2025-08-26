"use client";

import { useEffect, useState } from "react";
import type { AuditEvent, LGPDConsent } from "../types";

type LGPDComplianceProps = {
	patientId?: string;
	currentConsent?: LGPDConsent;
	onConsentUpdate: (consent: LGPDConsent) => Promise<void>;
	onAuditLog: (event: Omit<AuditEvent, "id" | "timestamp">) => Promise<void>;
	className?: string;
};

export function LGPDComplianceDashboard({
	patientId,
	currentConsent,
	onConsentUpdate,
	onAuditLog,
	className = "",
}: LGPDComplianceProps) {
	const [consent, setConsent] = useState<LGPDConsent | null>(
		currentConsent || null,
	);
	const [isUpdating, setIsUpdating] = useState(false);
	const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

	useEffect(() => {
		setConsent(currentConsent || null);
	}, [currentConsent]);

	const handleConsentChange = async (
		field: keyof Omit<
			LGPDConsent,
			"consentDate" | "consentVersion" | "ipAddress" | "userAgent"
		>,
		value: boolean,
	) => {
		if (!consent) {
			return;
		}

		const updatedConsent: LGPDConsent = {
			...consent,
			[field]: value,
			consentDate: new Date().toISOString(),
			consentVersion: "2.1", // LGPD compliance version
			ipAddress: "192.168.1.1", // Would be actual IP
			userAgent: navigator.userAgent,
		};

		setIsUpdating(true);

		try {
			await onConsentUpdate(updatedConsent);
			setConsent(updatedConsent);
			setLastUpdate(new Date());

			// Log LGPD audit event
			await onAuditLog({
				userId: "current-user",
				action: "LGPD_CONSENT_UPDATE",
				resource: `patient:${patientId}`,
				ipAddress: "192.168.1.1",
				userAgent: navigator.userAgent,
				outcome: "success",
				details: {
					field,
					newValue: value,
					patientId,
					consentVersion: "2.1",
				},
			});
		} catch (error) {
			// Log failed audit event
			await onAuditLog({
				userId: "current-user",
				action: "LGPD_CONSENT_UPDATE",
				resource: `patient:${patientId}`,
				ipAddress: "192.168.1.1",
				userAgent: navigator.userAgent,
				outcome: "failure",
				details: {
					error: (error as Error).toString(),
					field,
					attemptedValue: value,
				},
			});
		} finally {
			setIsUpdating(false);
		}
	};

	const getConsentStatus = () => {
		if (!consent) {
			return {
				status: "missing",
				color: "red",
				message: "Consentimento não coletado",
			};
		}

		const hasRequiredConsents = consent.dataProcessing;
		if (!hasRequiredConsents) {
			return {
				status: "incomplete",
				color: "yellow",
				message: "Consentimento incompleto",
			};
		}

		return { status: "complete", color: "green", message: "Conforme LGPD" };
	};

	const consentStatus = getConsentStatus();

	return (
		<div
			className={`lgpd-compliance rounded-lg border bg-white shadow-lg ${className}`}
		>
			{/* Header */}
			<div
				className={`rounded-t-lg border-l-4 p-4 ${
					consentStatus.color === "green"
						? "border-green-500 bg-green-50"
						: consentStatus.color === "yellow"
							? "border-yellow-500 bg-yellow-50"
							: "border-red-500 bg-red-50"
				}`}
			>
				<div className="flex items-center justify-between">
					<div className="flex items-center">
						<span className="mr-2 text-xl">🛡️</span>
						<h3 className="font-semibold text-gray-900 text-lg">
							Conformidade LGPD
						</h3>
					</div>
					<div
						className={`rounded-full px-3 py-1 font-medium text-sm ${
							consentStatus.color === "green"
								? "bg-green-100 text-green-800"
								: consentStatus.color === "yellow"
									? "bg-yellow-100 text-yellow-800"
									: "bg-red-100 text-red-800"
						}`}
					>
						{consentStatus.message}
					</div>
				</div>

				{lastUpdate && (
					<p className="mt-1 text-gray-600 text-sm">
						Última atualização: {lastUpdate.toLocaleString("pt-BR")}
					</p>
				)}
			</div>{" "}
			{/* Consent Management */}
			<div className="p-4">
				{consent ? (
					<div className="space-y-4">
						{/* Data Processing Consent - Required */}
						<div className="flex items-start justify-between rounded-lg border p-3">
							<div className="flex-1">
								<h4 className="font-medium text-gray-900">
									Processamento de Dados de Saúde
								</h4>
								<p className="mt-1 text-gray-600 text-sm">
									Autorização para processar dados pessoais de saúde conforme
									LGPD Art. 11
								</p>
								<div className="mt-2 flex items-center text-xs">
									<span className="rounded bg-red-100 px-2 py-1 text-red-800">
										OBRIGATÓRIO
									</span>
								</div>
							</div>
							<div className="ml-4">
								<label className="relative inline-flex cursor-pointer items-center">
									<input
										checked={consent.dataProcessing}
										className="peer sr-only"
										disabled={isUpdating}
										onChange={(e) =>
											handleConsentChange("dataProcessing", e.target.checked)
										}
										type="checkbox"
									/>
									<div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300" />
								</label>
							</div>
						</div>

						{/* Marketing Consent - Optional */}
						<div className="flex items-start justify-between rounded-lg border p-3">
							<div className="flex-1">
								<h4 className="font-medium text-gray-900">
									Comunicações de Marketing
								</h4>
								<p className="mt-1 text-gray-600 text-sm">
									Envio de informações sobre novos tratamentos e promoções
								</p>
								<div className="mt-2 flex items-center text-xs">
									<span className="rounded bg-blue-100 px-2 py-1 text-blue-800">
										OPCIONAL
									</span>
								</div>
							</div>
							<div className="ml-4">
								<label className="relative inline-flex cursor-pointer items-center">
									<input
										checked={consent.marketing}
										className="peer sr-only"
										disabled={isUpdating}
										onChange={(e) =>
											handleConsentChange("marketing", e.target.checked)
										}
										type="checkbox"
									/>
									<div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300" />
								</label>
							</div>
						</div>

						{/* Data Sharing Consent - Optional */}
						<div className="flex items-start justify-between rounded-lg border p-3">
							<div className="flex-1">
								<h4 className="font-medium text-gray-900">
									Compartilhamento com Parceiros
								</h4>
								<p className="mt-1 text-gray-600 text-sm">
									Compartilhamento de dados com laboratórios e clínicas
									parceiras
								</p>
								<div className="mt-2 flex items-center text-xs">
									<span className="rounded bg-blue-100 px-2 py-1 text-blue-800">
										OPCIONAL
									</span>
								</div>
							</div>
							<div className="ml-4">
								<label className="relative inline-flex cursor-pointer items-center">
									<input
										checked={consent.dataSharing}
										className="peer sr-only"
										disabled={isUpdating}
										onChange={(e) =>
											handleConsentChange("dataSharing", e.target.checked)
										}
										type="checkbox"
									/>
									<div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300" />
								</label>
							</div>
						</div>

						{/* Consent Details */}
						<div className="rounded-lg bg-gray-50 p-3 text-sm">
							<h5 className="mb-2 font-medium text-gray-700">
								Detalhes do Consentimento
							</h5>
							<div className="space-y-1 text-gray-600">
								<div>
									Data: {new Date(consent.consentDate).toLocaleString("pt-BR")}
								</div>
								<div>Versão: {consent.consentVersion}</div>
								<div>IP: {consent.ipAddress}</div>
							</div>
						</div>
					</div>
				) : (
					<div className="py-8 text-center">
						<span className="mb-4 block text-4xl">⚠️</span>
						<h4 className="mb-2 font-medium text-gray-900 text-lg">
							Consentimento LGPD Necessário
						</h4>
						<p className="mb-4 text-gray-600">
							É necessário coletar o consentimento do paciente antes de
							processar dados de saúde.
						</p>
						<button
							className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
							onClick={() => {
								// Initialize consent form
								const initialConsent: LGPDConsent = {
									dataProcessing: false,
									marketing: false,
									dataSharing: false,
									consentDate: new Date().toISOString(),
									consentVersion: "2.1",
									ipAddress: "192.168.1.1",
									userAgent: navigator.userAgent,
								};
								setConsent(initialConsent);
							}}
						>
							Iniciar Coleta de Consentimento
						</button>
					</div>
				)}

				{/* Loading State */}
				{isUpdating && (
					<div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white bg-opacity-75">
						<div className="flex items-center">
							<div className="mr-3 h-6 w-6 animate-spin rounded-full border-blue-600 border-b-2" />
							<span className="text-blue-600">
								Atualizando consentimento...
							</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

// Data Classification Badge Component
export function DataClassificationBadge({
	classification,
}: {
	classification: "public" | "internal" | "confidential" | "restricted";
}) {
	const config = {
		public: { color: "green", icon: "🌐", label: "Público" },
		internal: { color: "blue", icon: "🏢", label: "Interno" },
		confidential: { color: "yellow", icon: "🔒", label: "Confidencial" },
		restricted: { color: "red", icon: "🚨", label: "Restrito" },
	};

	const { color, icon, label } = config[classification];

	return (
		<span
			className={`inline-flex items-center rounded-full px-2 py-1 font-medium text-xs ${
				color === "green"
					? "bg-green-100 text-green-800"
					: color === "blue"
						? "bg-blue-100 text-blue-800"
						: color === "yellow"
							? "bg-yellow-100 text-yellow-800"
							: "bg-red-100 text-red-800"
			}`}
		>
			<span className="mr-1">{icon}</span>
			{label}
		</span>
	);
}

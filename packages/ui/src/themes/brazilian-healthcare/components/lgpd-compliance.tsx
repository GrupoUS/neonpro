"use client";

import { useEffect, useState } from "react";
import type { AuditEvent, LGPDConsent } from "../types";

interface LGPDComplianceProps {
  patientId?: string;
  currentConsent?: LGPDConsent;
  onConsentUpdate: (consent: LGPDConsent) => Promise<void>;
  onAuditLog: (event: Omit<AuditEvent, "id" | "timestamp">) => Promise<void>;
  className?: string;
}

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
  const [lastUpdate, setLastUpdate] = useState<Date | null>();

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

      // Log the consent change for audit trail
      await onAuditLog({
        action: "consent_updated",
        userId: patientId || "unknown",
        details: {
          field,
          newValue: value,
          consentVersion: "2.1",
        },
        ipAddress: "192.168.1.1",
        userAgent: navigator.userAgent,
      });
    } catch (error) {
      console.error("Failed to update consent:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!consent) {
    return (
      <div className={`lgpd-compliance-dashboard ${className}`}>
        <div className="no-consent-message">
          <h3>Consentimento LGPD Necessário</h3>
          <p>
            Para continuar, é necessário obter o consentimento do paciente conforme a Lei Geral de
            Proteção de Dados (LGPD).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`lgpd-compliance-dashboard ${className}`}>
      <div className="compliance-header">
        <h3>Painel de Conformidade LGPD</h3>
        <div className="compliance-status">
          <span className="status-indicator">
            {consent.dataProcessing && consent.dataSharing && consent.marketing
              ? "✅ Conforme"
              : "⚠️ Revisão Necessária"}
          </span>
          {lastUpdate && (
            <span className="last-update">
              Última atualização: {lastUpdate.toLocaleString("pt-BR")}
            </span>
          )}
        </div>
      </div>

      <div className="consent-controls">
        <div className="consent-section">
          <h4>Processamento de Dados</h4>
          <label className="consent-checkbox">
            <input
              type="checkbox"
              checked={consent.dataProcessing}
              onChange={(e) => handleConsentChange("dataProcessing", e.target.checked)}
              disabled={isUpdating}
            />
            <span className="checkbox-label">
              Autorizo o processamento dos meus dados pessoais para fins de atendimento médico e
              gestão de saúde.
            </span>
          </label>
        </div>

        <div className="consent-section">
          <h4>Compartilhamento de Dados</h4>
          <label className="consent-checkbox">
            <input
              type="checkbox"
              checked={consent.dataSharing}
              onChange={(e) => handleConsentChange("dataSharing", e.target.checked)}
              disabled={isUpdating}
            />
            <span className="checkbox-label">
              Autorizo o compartilhamento dos meus dados com profissionais de saúde e laboratórios
              parceiros quando necessário para o tratamento.
            </span>
          </label>
        </div>

        <div className="consent-section">
          <h4>Comunicações de Marketing</h4>
          <label className="consent-checkbox">
            <input
              type="checkbox"
              checked={consent.marketing}
              onChange={(e) => handleConsentChange("marketing", e.target.checked)}
              disabled={isUpdating}
            />
            <span className="checkbox-label">
              Autorizo o recebimento de comunicações sobre novos serviços, promoções e informações
              de saúde.
            </span>
          </label>
        </div>
      </div>

      <div className="consent-metadata">
        <div className="metadata-item">
          <strong>Data do Consentimento:</strong>{" "}
          {new Date(consent.consentDate).toLocaleString("pt-BR")}
        </div>
        <div className="metadata-item">
          <strong>Versão:</strong> {consent.consentVersion}
        </div>
        <div className="metadata-item">
          <strong>IP:</strong> {consent.ipAddress}
        </div>
      </div>

      {isUpdating && (
        <div className="updating-overlay">
          <div className="updating-message">
            <div className="loading-spinner" />
            Atualizando consentimento...
          </div>
        </div>
      )}
    </div>
  );
}

// Data Classification Badge Component
interface DataClassificationProps {
  classification: "public" | "internal" | "confidential" | "restricted";
  className?: string;
}

export function DataClassificationBadge({
  classification,
  className = "",
}: DataClassificationProps) {
  const getClassificationInfo = (type: string) => {
    switch (type) {
      case "public":
        return { label: "Público", color: "green", icon: "🌐" };
      case "internal":
        return { label: "Interno", color: "blue", icon: "🏢" };
      case "confidential":
        return { label: "Confidencial", color: "yellow", icon: "🔒" };
      case "restricted":
        return { label: "Restrito", color: "red", icon: "🚫" };
      default:
        return { label: "Não Classificado", color: "gray", icon: "❓" };
    }
  };

  const info = getClassificationInfo(classification);

  return (
    <span
      className={`data-classification-badge classification-${info.color} ${className}`}
      title={`Classificação de dados: ${info.label}`}
      role="img"
      aria-label={`Dados classificados como ${info.label}`}
    >
      <span className="classification-icon">{info.icon}</span>
      <span className="classification-label">{info.label}</span>
    </span>
  );
}

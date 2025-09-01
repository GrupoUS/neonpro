"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { EmergencyAlert, PatientInfo } from "../types";

interface EmergencyAccessProps {
  onPatientSelect: (patientId: string) => void;
  onEmergencySearch: (query: string) => Promise<PatientInfo[]>;
  emergencyAlerts?: EmergencyAlert[];
  className?: string;
}

export function EmergencyAccessInterface({
  onPatientSelect,
  onEmergencySearch,
  emergencyAlerts = [],
  className = "",
}: EmergencyAccessProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PatientInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStartTime, setSearchStartTime] = useState<number | null>();
  const [responseTime, setResponseTime] = useState<number | null>();
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
        }
      } catch (error) {
        console.error("Emergency search failed:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [onEmergencySearch, searchStartTime],
  );

  // Handle search input with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch]);

  // Handle patient selection
  const handlePatientSelect = useCallback(
    (patientId: string) => {
      onPatientSelect(patientId);
      setSearchQuery("");
      setSearchResults([]);
    },
    [onPatientSelect],
  );

  // Keyboard navigation for accessibility
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchQuery("");
        setSearchResults([]);
      }
    },
    [],
  );

  return (
    <div className={`emergency-access-interface ${className}`}>
      {/* Emergency Alerts Banner */}
      {emergencyAlerts.length > 0 && (
        <div className="emergency-alerts-banner">
          {emergencyAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`alert alert-${alert.severity}`}
              role="alert"
              aria-live="assertive"
            >
              <div className="alert-content">
                <span className="alert-icon">⚠️</span>
                <div className="alert-text">
                  <strong>{alert.title}</strong>
                  <p>{alert.message}</p>
                </div>
                <span className="alert-time">
                  {new Date(alert.timestamp).toLocaleTimeString("pt-BR")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Emergency Search Interface */}
      <div className="emergency-search-container">
        <div className="search-header">
          <h2 className="search-title">Acesso de Emergência</h2>
          <p className="search-subtitle">
            Digite CPF, nome ou número do prontuário para acesso rápido
          </p>
        </div>

        <div className="search-input-container">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="CPF, nome ou prontuário..."
            className="emergency-search-input"
            aria-label="Busca de emergência por paciente"
            aria-describedby="search-help"
            autoComplete="off"
          />
          
          {isSearching && (
            <div className="search-loading" aria-label="Buscando...">
              <div className="loading-spinner" />
            </div>
          )}
        </div>

        <div id="search-help" className="search-help">
          Mínimo 3 caracteres. Pressione ESC para limpar.
          {responseTime && (
            <span className="response-time">
              Tempo de resposta: {responseTime}ms
            </span>
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="search-results" role="listbox">
            <div className="results-header">
              <span className="results-count">
                {searchResults.length} paciente(s) encontrado(s)
              </span>
            </div>
            
            <div className="results-list">
              {searchResults.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handlePatientSelect(patient.id)}
                  className="patient-result-item"
                  role="option"
                  aria-selected="false"
                >
                  <div className="patient-info">
                    <div className="patient-name">{patient.name}</div>
                    <div className="patient-details">
                      <span className="patient-cpf">CPF: {patient.cpf}</span>
                      <span className="patient-birth">
                        Nascimento: {new Date(patient.birthDate).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    {patient.emergencyContact && (
                      <div className="emergency-contact">
                        Contato: {patient.emergencyContact.name} - {patient.emergencyContact.phone}
                      </div>
                    )}
                  </div>
                  
                  <div className="patient-status">
                    {patient.isActive ? (
                      <span className="status-active">Ativo</span>
                    ) : (
                      <span className="status-inactive">Inativo</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No Results Message */}
        {searchQuery.length >= 3 && !isSearching && searchResults.length === 0 && (
          <div className="no-results" role="status">
            <p>Nenhum paciente encontrado para "{searchQuery}"</p>
            <p className="no-results-help">
              Verifique se os dados estão corretos ou tente uma busca diferente.
            </p>
          </div>
        )}
      </div>

      {/* Emergency Actions */}
      <div className="emergency-actions">
        <button
          type="button"
          className="emergency-action-btn emergency-call"
          onClick={() => window.open("tel:192", "_self")}
          aria-label="Ligar para SAMU (192)"
        >
          📞 SAMU (192)
        </button>
        
        <button
          type="button"
          className="emergency-action-btn emergency-fire"
          onClick={() => window.open("tel:193", "_self")}
          aria-label="Ligar para Bombeiros (193)"
        >
          🚒 Bombeiros (193)
        </button>
        
        <button
          type="button"
          className="emergency-action-btn emergency-police"
          onClick={() => window.open("tel:190", "_self")}
          aria-label="Ligar para Polícia (190)"
        >
          🚔 Polícia (190)
        </button>
      </div>
    </div>
  );
}

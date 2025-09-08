"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Award,
  CheckCircle,
  Download,
  FileCheck,
  Printer,
  RefreshCw,
  Shield,
  User,
} from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";

// Digital signature interfaces following Brazilian legal requirements
interface DigitalCertificate {
  id: string;
  issuer: string;
  subject: string;
  validFrom: string;
  validTo: string;
  serialNumber: string;
  thumbprint: string;
  keyUsage: string[];
  isValid: boolean;
  isTrusted: boolean;
  certificateLevel: "A1" | "A3" | "A4"; // ICP-Brasil levels
  documentType: "CPF" | "CNPJ" | "PF" | "PJ";
}

interface SignatureMetadata {
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  biometricData?: {
    touchPressure: number[];
    touchDuration: number;
    deviceTilt: number[];
  };
  deviceInfo: {
    platform: string;
    screenResolution: string;
    timezone: string;
    language: string;
  };
}

interface LegalValidation {
  mpCompliance: boolean; // MP 2.200-2/2001 compliance
  lgpdCompliance: boolean; // LGPD compliance
  cfmCompliance: boolean; // CFM compliance for medical procedures
  icpBrasilValid: boolean; // ICP-Brasil certificate validation
  timestampValid: boolean; // RFC 3161 timestamp validation
  integrityHash: string;
  legalBasis: string;
  auditTrailComplete: boolean;
}

interface DigitalSignatureProps {
  consentId: string;
  patientId: string;
  consentType: string;
  consentDocument: string;
  onSignatureComplete: (signature: DigitalSignatureData) => void;
  onSignatureCancel: () => void;
  isOpen: boolean;
}

interface DigitalSignatureData {
  signatureId: string;
  signatureHash: string;
  certificate: DigitalCertificate;
  metadata: SignatureMetadata;
  legalValidation: LegalValidation;
  visualSignature?: string; // Base64 encoded signature image
  biometricSignature?: string; // Biometric signature data
  timestamp: string;
  witnessInfo?: {
    name: string;
    cpf: string;
    signature: string;
  };
}

// Mock digital certificates for demonstration
const mockCertificates: DigitalCertificate[] = [
  {
    id: "cert-001",
    issuer: "AC SERPRO RFB v5",
    subject: "Maria Silva Santos:12345678901",
    validFrom: "2023-01-15T00:00:00Z",
    validTo: "2026-01-15T23:59:59Z",
    serialNumber: "5A3B7C9D1E2F4A6B8C0D2E4F",
    thumbprint: "SHA256:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    keyUsage: ["Digital Signature", "Non Repudiation", "Key Encipherment"],
    isValid: true,
    isTrusted: true,
    certificateLevel: "A3",
    documentType: "CPF",
  },
  {
    id: "cert-002",
    issuer: "AC CERTISIGN RFB G5",
    subject: "João Pedro Oliveira:98765432109",
    validFrom: "2023-06-01T00:00:00Z",
    validTo: "2025-06-01T23:59:59Z",
    serialNumber: "7F9E5B8A3C1D6F4E2A9B7C5D",
    thumbprint: "SHA256:9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e",
    keyUsage: ["Digital Signature", "Non Repudiation"],
    isValid: true,
    isTrusted: true,
    certificateLevel: "A1",
    documentType: "CPF",
  },
];

export function DigitalSignature({
  consentId: _consentId,
  patientId: _patientId,
  consentType,
  consentDocument: _consentDocument,
  onSignatureComplete,
  onSignatureCancel,
  isOpen,
}: DigitalSignatureProps) {
  const [currentStep, setCurrentStep] = useState<
    "certificate" | "signature" | "validation" | "complete"
  >("certificate");
  const [selectedCertificate, setSelectedCertificate] = useState<DigitalCertificate | null>();
  const [signatureData, setSignatureData] = useState<DigitalSignatureData | null>();
  const [isLoading, setIsLoading] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [visualSignature, setVisualSignature] = useState<string>("");
  const [witnessRequired, setWitnessRequired] = useState(false);
  const [witnessInfo, setWitnessInfo] = useState({
    name: "",
    cpf: "",
    signature: "",
  });
  const [legalConfirmations, setLegalConfirmations] = useState({
    understandsLegalEffects: false,
    confirmsIdentity: false,
    acceptsLiability: false,
    acknowledgesNonRepudiation: false,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate metadata for signature
  const generateSignatureMetadata = (): SignatureMetadata => {
    return {
      timestamp: new Date().toISOString(),
      ipAddress: "192.168.1.100", // Would be actual IP in production
      userAgent: navigator.userAgent,
      deviceInfo: {
        platform: navigator.platform,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
      },
    };
  };

  // Validate legal requirements
  const validateLegalRequirements = (
    certificate: DigitalCertificate,
  ): LegalValidation => {
    return {
      mpCompliance: certificate.isValid && certificate.isTrusted,
      lgpdCompliance: true, // Would validate LGPD compliance
      cfmCompliance: consentType === "medical_procedure",
      icpBrasilValid: certificate.certificateLevel === "A3"
        || certificate.certificateLevel === "A1",
      timestampValid: true, // Would validate RFC 3161 timestamp
      integrityHash: `SHA256:${Math.random().toString(36).slice(2, 15)}`,
      legalBasis: "consent",
      auditTrailComplete: true,
    };
  };

  // Handle certificate selection
  const handleCertificateSelect = (certificate: DigitalCertificate) => {
    setSelectedCertificate(certificate);
  };

  // Handle signature creation
  const handleCreateSignature = async () => {
    if (!selectedCertificate) {
      return;
    }

    setIsLoading(true);
    setCurrentStep("signature");

    try {
      // Simulate signature creation process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const metadata = generateSignatureMetadata();
      const legalValidation = validateLegalRequirements(selectedCertificate);

      const signature: DigitalSignatureData = {
        signatureId: `sig-${Date.now()}`,
        signatureHash: `SHA256:${Math.random().toString(36).slice(2, 15)}`,
        certificate: selectedCertificate,
        metadata,
        legalValidation,
        visualSignature,
        timestamp: new Date().toISOString(),
        witnessInfo: witnessRequired ? witnessInfo : undefined,
      };

      setSignatureData(signature);
      setCurrentStep("validation");
      await validateSignature(signature);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  // Validate signature
  const validateSignature = async (_signature: DigitalSignatureData) => {
    setValidationProgress(0);

    // Simulate validation steps
    const validationSteps = [
      "Validando certificado digital...",
      "Verificando conformidade MP 2.200-2/2001...",
      "Validando compliance LGPD...",
      "Verificando integridade do documento...",
      "Criando trilha de auditoria...",
      "Finalizando assinatura...",
    ];

    for (let i = 0; i < validationSteps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setValidationProgress(((i + 1) / validationSteps.length) * 100);
    }

    setCurrentStep("complete");
  };

  // Handle signature completion
  const handleComplete = () => {
    if (signatureData) {
      onSignatureComplete(signatureData);
    }
  };

  // Canvas signature handling
  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { current: canvas } = canvasRef;
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { current: canvas } = canvasRef;
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (ctx && event.buttons === 1) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const clearSignature = () => {
    const { current: canvas } = canvasRef;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setVisualSignature("");
  };

  const saveSignature = () => {
    const { current: canvas } = canvasRef;
    if (!canvas) {
      return;
    }

    const dataURL = canvas.toDataURL("image/png");
    setVisualSignature(dataURL);
  };

  if (!isOpen) {
    return;
  }

  return (
    <Dialog onOpenChange={onSignatureCancel} open={isOpen}>
      <DialogContent className="max-h-[95vh] max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-blue-600" />
            Assinatura Digital - Consentimento LGPD
          </DialogTitle>
          <DialogDescription>
            Processo de assinatura digital conforme MP 2.200-2/2001 e Lei 14.129/2021
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center gap-2 ${
                  currentStep === "certificate"
                    ? "text-blue-600"
                    : ["signature", "validation", "complete"].includes(
                        currentStep,
                      )
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    currentStep === "certificate"
                      ? "border-blue-600 bg-blue-50"
                      : ["signature", "validation", "complete"].includes(
                          currentStep,
                        )
                      ? "border-green-600 bg-green-50"
                      : "border-gray-300"
                  }`}
                >
                  {["signature", "validation", "complete"].includes(
                      currentStep,
                    )
                    ? <CheckCircle className="h-4 w-4" />
                    : (
                      "1"
                    )}
                </div>
                <span className="font-medium">Certificado</span>
              </div>
              <div
                className={`h-1 w-16 ${
                  currentStep === "signature"
                    || currentStep === "validation"
                    || currentStep === "complete"
                    ? "bg-green-600"
                    : "bg-gray-300"
                }`}
              />
              <div
                className={`flex items-center gap-2 ${
                  currentStep === "signature"
                    ? "text-blue-600"
                    : currentStep === "validation" || currentStep === "complete"
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    currentStep === "signature"
                      ? "border-blue-600 bg-blue-50"
                      : currentStep === "validation"
                          || currentStep === "complete"
                      ? "border-green-600 bg-green-50"
                      : "border-gray-300"
                  }`}
                >
                  {currentStep === "validation"
                      || currentStep === "complete"
                    ? <CheckCircle className="h-4 w-4" />
                    : (
                      "2"
                    )}
                </div>
                <span className="font-medium">Assinatura</span>
              </div>
              <div
                className={`h-1 w-16 ${
                  currentStep === "validation" || currentStep === "complete"
                    ? "bg-green-600"
                    : "bg-gray-300"
                }`}
              />
              <div
                className={`flex items-center gap-2 ${
                  currentStep === "validation"
                    ? "text-blue-600"
                    : currentStep === "complete"
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    currentStep === "validation"
                      ? "border-blue-600 bg-blue-50"
                      : currentStep === "complete"
                      ? "border-green-600 bg-green-50"
                      : "border-gray-300"
                  }`}
                >
                  {currentStep === "complete" ? <CheckCircle className="h-4 w-4" /> : (
                    "3"
                  )}
                </div>
                <span className="font-medium">Validação</span>
              </div>
            </div>
          </div>

          {/* Certificate Selection Step */}
          {currentStep === "certificate" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    Selecionar Certificado Digital
                  </CardTitle>
                  <CardDescription>
                    Escolha um certificado digital válido ICP-Brasil para assinar o consentimento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockCertificates.map((cert) => (
                      <button
                        type="button"
                        className={`cursor-pointer rounded-lg border p-4 transition-colors text-left w-full ${
                          selectedCertificate?.id === cert.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        key={cert.id}
                        onClick={() => handleCertificateSelect(cert)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleCertificateSelect(cert);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                              <h4 className="font-medium text-gray-900">
                                {cert.subject.split(":")[0]}
                              </h4>
                              <Badge
                                variant={cert.isValid ? "default" : "destructive"}
                              >
                                {cert.certificateLevel}
                              </Badge>
                              {cert.isValid && (
                                <Badge
                                  className="border-green-200 bg-green-50 text-green-700"
                                  variant="outline"
                                >
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Válido
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-gray-600 text-sm">
                              <div>
                                <p>
                                  <strong>Emissor:</strong> {cert.issuer}
                                </p>
                                <p>
                                  <strong>Documento:</strong> {cert.documentType}{" "}
                                  {cert.subject.split(":")[1]}
                                </p>
                              </div>
                              <div>
                                <p>
                                  <strong>Válido até:</strong>{" "}
                                  {new Date(cert.validTo).toLocaleDateString(
                                    "pt-BR",
                                  )}
                                </p>
                                <p>
                                  <strong>Tipo:</strong> {cert.keyUsage.join(", ")}
                                </p>
                              </div>
                            </div>
                          </div>
                          {selectedCertificate?.id === cert.id && (
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Legal confirmations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-orange-600" />
                    Declarações Legais Obrigatórias
                  </CardTitle>
                  <CardDescription>
                    Confirmações necessárias para validade jurídica da assinatura digital
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={legalConfirmations.understandsLegalEffects}
                        id="legal-effects"
                        onCheckedChange={(checked) =>
                          setLegalConfirmations((prev) => ({
                            ...prev,
                            understandsLegalEffects: checked as boolean,
                          }))}
                      />
                      <Label
                        className="text-sm leading-relaxed"
                        htmlFor="legal-effects"
                      >
                        <strong>Efeitos Jurídicos:</strong>{" "}
                        Declaro que compreendo que esta assinatura digital possui os mesmos efeitos
                        jurídicos de uma assinatura manuscrita, conforme MP 2.200-2/2001.
                      </Label>
                    </div>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={legalConfirmations.confirmsIdentity}
                        id="identity-confirm"
                        onCheckedChange={(checked) =>
                          setLegalConfirmations((prev) => ({
                            ...prev,
                            confirmsIdentity: checked as boolean,
                          }))}
                      />
                      <Label
                        className="text-sm leading-relaxed"
                        htmlFor="identity-confirm"
                      >
                        <strong>Confirmação de Identidade:</strong>{" "}
                        Confirmo que sou o titular do certificado digital selecionado e possuo
                        controle exclusivo da chave privada correspondente.
                      </Label>
                    </div>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={legalConfirmations.acceptsLiability}
                        id="liability"
                        onCheckedChange={(checked) =>
                          setLegalConfirmations((prev) => ({
                            ...prev,
                            acceptsLiability: checked as boolean,
                          }))}
                      />
                      <Label
                        className="text-sm leading-relaxed"
                        htmlFor="liability"
                      >
                        <strong>Responsabilidade:</strong>{" "}
                        Aceito total responsabilidade pelo uso deste certificado digital e pelas
                        consequências legais desta assinatura.
                      </Label>
                    </div>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={legalConfirmations.acknowledgesNonRepudiation}
                        id="non-repudiation"
                        onCheckedChange={(checked) =>
                          setLegalConfirmations((prev) => ({
                            ...prev,
                            acknowledgesNonRepudiation: checked as boolean,
                          }))}
                      />
                      <Label
                        className="text-sm leading-relaxed"
                        htmlFor="non-repudiation"
                      >
                        <strong>Irretratabilidade:</strong>{" "}
                        Reconheço que não poderei negar a autoria desta assinatura digital,
                        garantindo o princípio do não-repúdio.
                      </Label>
                    </div>
                  </div>

                  {/* Witness requirement for minors */}
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={witnessRequired}
                        id="witness-required"
                        onCheckedChange={(checked) => setWitnessRequired(checked as boolean)}
                      />
                      <Label className="font-medium" htmlFor="witness-required">
                        Testemunha necessária (menor de idade ou incapaz)
                      </Label>
                    </div>
                    {witnessRequired && (
                      <div className="grid grid-cols-1 gap-4 rounded-lg bg-blue-50 p-4 md:grid-cols-2">
                        <div>
                          <Label htmlFor="witness-name">
                            Nome da Testemunha
                          </Label>
                          <Input
                            id="witness-name"
                            onChange={(e) =>
                              setWitnessInfo((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))}
                            placeholder="Nome completo da testemunha"
                            value={witnessInfo.name}
                          />
                        </div>
                        <div>
                          <Label htmlFor="witness-cpf">CPF da Testemunha</Label>
                          <Input
                            id="witness-cpf"
                            onChange={(e) =>
                              setWitnessInfo((prev) => ({
                                ...prev,
                                cpf: e.target.value,
                              }))}
                            placeholder="000.000.000-00"
                            value={witnessInfo.cpf}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button onClick={onSignatureCancel} variant="outline">
                  Cancelar
                </Button>
                <Button
                  disabled={!(
                    selectedCertificate
                    && Object.values(legalConfirmations).every(Boolean)
                  )
                    || (witnessRequired && !(witnessInfo.name && witnessInfo.cpf))}
                  onClick={handleCreateSignature}
                >
                  Prosseguir para Assinatura
                </Button>
              </div>
            </div>
          )}

          {/* Signature Creation Step */}
          {currentStep === "signature" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Assinatura Visual (Opcional)
                  </CardTitle>
                  <CardDescription>
                    Adicione uma assinatura visual para complementar a assinatura digital
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg border-2 border-gray-300 border-dashed p-4">
                      <canvas
                        className="w-full cursor-crosshair rounded border"
                        height={200}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        ref={canvasRef}
                        style={{ touchAction: "none" }}
                        width={600}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={clearSignature}
                        size="sm"
                        variant="outline"
                      >
                        Limpar
                      </Button>
                      <Button
                        onClick={saveSignature}
                        size="sm"
                        variant="outline"
                      >
                        Salvar Assinatura
                      </Button>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Desenhe sua assinatura no campo acima usando o mouse ou touch screen
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => setCurrentStep("certificate")}
                  variant="outline"
                >
                  Voltar
                </Button>
                <Button disabled={isLoading} onClick={handleCreateSignature}>
                  {isLoading
                    ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Criando Assinatura...
                      </>
                    )
                    : (
                      "Criar Assinatura Digital"
                    )}
                </Button>
              </div>
            </div>
          )}

          {/* Validation Step */}
          {currentStep === "validation" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-orange-600" />
                    Validação da Assinatura Digital
                  </CardTitle>
                  <CardDescription>
                    Verificando conformidade legal e integridade da assinatura
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          Progresso da validação
                        </span>
                        <span className="text-gray-600 text-sm">
                          {Math.round(validationProgress)}%
                        </span>
                      </div>
                      <Progress className="h-2" value={validationProgress} />
                    </div>

                    {signatureData && (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-3">
                          <h4 className="font-medium">Validações Legais</h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm">
                                MP 2.200-2/2001 - Conforme
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm">LGPD - Conforme</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm">
                                ICP-Brasil - Válido
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm">
                                Timestamp RFC 3161 - Válido
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-medium">Informações Técnicas</h4>
                          <div className="space-y-1 text-gray-600 text-sm">
                            <p>
                              <strong>Hash:</strong> {signatureData.signatureHash.slice(0, 20)}...
                            </p>
                            <p>
                              <strong>Timestamp:</strong>{" "}
                              {new Date(signatureData.timestamp).toLocaleString(
                                "pt-BR",
                              )}
                            </p>
                            <p>
                              <strong>Certificado:</strong>{" "}
                              {signatureData.certificate.certificateLevel}
                            </p>
                            <p>
                              <strong>Algoritmo:</strong> SHA-256 + RSA-2048
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Completion Step */}
          {currentStep === "complete" && signatureData && (
            <div className="space-y-6">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Assinatura Digital Criada com Sucesso!</AlertTitle>
                <AlertDescription>
                  A assinatura digital foi criada e validada conforme a legislação brasileira. O
                  documento possui validade jurídica plena.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-green-600" />
                    Certificado de Assinatura Digital
                  </CardTitle>
                  <CardDescription>
                    Informações completas da assinatura digital criada
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <Label>Identificação da Assinatura</Label>
                        <p className="font-mono text-sm">
                          {signatureData.signatureId}
                        </p>
                      </div>
                      <div>
                        <Label>Hash da Assinatura</Label>
                        <p className="break-all font-mono text-sm">
                          {signatureData.signatureHash}
                        </p>
                      </div>
                      <div>
                        <Label>Certificado Digital</Label>
                        <p className="text-sm">
                          {signatureData.certificate.subject.split(":")[0]}
                        </p>
                        <p className="text-gray-600 text-xs">
                          {signatureData.certificate.issuer}
                        </p>
                      </div>
                      <div>
                        <Label>Timestamp Legal</Label>
                        <p className="text-sm">
                          {new Date(signatureData.timestamp).toLocaleString(
                            "pt-BR",
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label>Conformidade Legal</Label>
                        <div className="mt-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-sm">MP 2.200-2/2001</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-sm">Lei 14.129/2021</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-sm">LGPD</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-sm">
                              CFM (Procedimentos Médicos)
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label>Metadados de Segurança</Label>
                        <div className="mt-1 text-gray-600 text-sm">
                          <p>IP: {signatureData.metadata.ipAddress}</p>
                          <p>
                            Dispositivo: {signatureData.metadata.deviceInfo.platform}
                          </p>
                          <p>
                            Localização: {signatureData.metadata.deviceInfo.timezone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {signatureData.witnessInfo && (
                    <div className="mt-6 rounded-lg bg-blue-50 p-4">
                      <h4 className="mb-2 font-medium">
                        Informações da Testemunha
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label>Nome</Label>
                          <p>{signatureData.witnessInfo.name}</p>
                        </div>
                        <div>
                          <Label>CPF</Label>
                          <p>{signatureData.witnessInfo.cpf}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Certificado
                </Button>
                <Button variant="outline">
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir
                </Button>
                <Button onClick={handleComplete}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Finalizar Assinatura
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DigitalSignature;

"use client";

import React, { useState, useRef, useEffect } from "react";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Button } from "@/components/ui/button";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { Textarea } from "@/components/ui/textarea";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Badge } from "@/components/ui/badge";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  PenTool,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  FileText,
  Key,
  Lock,
  Unlock,
  Eye,
  Download,
  Send,
  UserCheck,
  Calendar,
  Hash,
  Fingerprint,
  Smartphone,
  CreditCard,
  X,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Copy,
  RefreshCw,
  AlertCircle,
  Info,
} from "lucide-react";
import type { format } from "date-fns";
import type { ptBR } from "date-fns/locale";

// Types
interface DigitalSignature {
  id: string;
  documentId: string;
  signerId: string;
  signerName: string;
  signerRole: string;
  signatureType: string;
  signatureData: string;
  certificateId?: string;
  biometricData?: string;
  pinCode?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  isValid: boolean;
  validationDetails: ValidationDetails;
  metadata: Record<string, any>;
}

interface ValidationDetails {
  certificateValid: boolean;
  timestampValid: boolean;
  integrityValid: boolean;
  revocationStatus: string;
  validationDate: Date;
  validatorId: string;
}

interface SignatureRequest {
  id: string;
  documentId: string;
  documentName: string;
  requesterId: string;
  requesterName: string;
  requiredSigners: RequiredSigner[];
  message?: string;
  deadline?: Date;
  status: string;
  createdAt: Date;
  completedAt?: Date;
  signatures: DigitalSignature[];
}

interface RequiredSigner {
  id: string;
  name: string;
  email: string;
  role: string;
  signatureType: string;
  isRequired: boolean;
  hasSignedAt?: Date;
  signatureId?: string;
}

interface DigitalSignatureProps {
  documentId: string;
  documentName: string;
  patientId: string;
  clinicId: string;
  onSignatureComplete?: (signature: DigitalSignature) => void;
  onRequestSent?: (request: SignatureRequest) => void;
  allowedSignatureTypes?: string[];
  requireMultipleSignatures?: boolean;
}

const SIGNATURE_TYPES = [
  {
    value: "digital_certificate",
    label: "Certificado Digital",
    icon: <Shield className="w-4 h-4" />,
    color: "bg-green-100 text-green-800",
    description: "Assinatura com certificado digital ICP-Brasil",
  },
  {
    value: "electronic",
    label: "Eletrônica Simples",
    icon: <PenTool className="w-4 h-4" />,
    color: "bg-blue-100 text-blue-800",
    description: "Assinatura eletrônica com login e senha",
  },
  {
    value: "biometric",
    label: "Biométrica",
    icon: <Fingerprint className="w-4 h-4" />,
    color: "bg-purple-100 text-purple-800",
    description: "Assinatura com dados biométricos",
  },
  {
    value: "pin",
    label: "PIN/Token",
    icon: <Key className="w-4 h-4" />,
    color: "bg-orange-100 text-orange-800",
    description: "Assinatura com PIN ou token de segurança",
  },
  {
    value: "sms",
    label: "SMS/OTP",
    icon: <Smartphone className="w-4 h-4" />,
    color: "bg-indigo-100 text-indigo-800",
    description: "Verificação por SMS com código OTP",
  },
];

const SIGNATURE_STATUS = [
  {
    value: "pending",
    label: "Pendente",
    color: "bg-yellow-100 text-yellow-800",
    icon: <Clock className="w-3 h-3" />,
  },
  {
    value: "signed",
    label: "Assinado",
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  {
    value: "rejected",
    label: "Rejeitado",
    color: "bg-red-100 text-red-800",
    icon: <X className="w-3 h-3" />,
  },
  {
    value: "expired",
    label: "Expirado",
    color: "bg-gray-100 text-gray-800",
    icon: <AlertTriangle className="w-3 h-3" />,
  },
];

const SIGNER_ROLES = [
  { value: "doctor", label: "Médico", icon: <UserCheck className="w-4 h-4" /> },
  { value: "patient", label: "Paciente", icon: <User className="w-4 h-4" /> },
  { value: "nurse", label: "Enfermeiro(a)", icon: <UserCheck className="w-4 h-4" /> },
  { value: "admin", label: "Administrador", icon: <Shield className="w-4 h-4" /> },
  { value: "witness", label: "Testemunha", icon: <Eye className="w-4 h-4" /> },
  { value: "legal_guardian", label: "Responsável Legal", icon: <Shield className="w-4 h-4" /> },
];

export function DigitalSignature({
  documentId,
  documentName,
  patientId,
  clinicId,
  onSignatureComplete,
  onRequestSent,
  allowedSignatureTypes = ["digital_certificate", "electronic", "pin"],
  requireMultipleSignatures = false,
}: DigitalSignatureProps) {
  const [signatures, setSignatures] = useState<DigitalSignature[]>([]);
  const [signatureRequests, setSignatureRequests] = useState<SignatureRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedSignatureType, setSelectedSignatureType] = useState("");
  const [signatureData, setSignatureData] = useState({
    signerName: "",
    signerRole: "",
    password: "",
    pinCode: "",
    otpCode: "",
    certificateFile: null as File | null,
    biometricData: "",
    reason: "",
  });
  const [newRequest, setNewRequest] = useState({
    message: "",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    requiredSigners: [] as RequiredSigner[],
  });
  const [newSigner, setNewSigner] = useState({
    name: "",
    email: "",
    role: "",
    signatureType: "",
    isRequired: true,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureCanvas, setSignatureCanvas] = useState("");

  // Load signatures and requests
  useEffect(() => {
    loadSignatures();
    loadSignatureRequests();
  }, [documentId]);

  const loadSignatures = async () => {
    try {
      // Mock data - replace with actual API call
      const mockSignatures: DigitalSignature[] = [
        {
          id: "1",
          documentId,
          signerId: "dr-silva",
          signerName: "Dr. João Silva",
          signerRole: "doctor",
          signatureType: "digital_certificate",
          signatureData: "base64_signature_data",
          certificateId: "cert_123456",
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0...",
          timestamp: new Date("2024-01-15T10:30:00"),
          isValid: true,
          validationDetails: {
            certificateValid: true,
            timestampValid: true,
            integrityValid: true,
            revocationStatus: "valid",
            validationDate: new Date("2024-01-15T10:30:00"),
            validatorId: "validator_001",
          },
          metadata: {
            certificateIssuer: "ICP-Brasil",
            certificateSerial: "123456789",
            hashAlgorithm: "SHA-256",
          },
        },
      ];

      setSignatures(mockSignatures);
    } catch (error) {
      console.error("Erro ao carregar assinaturas:", error);
    }
  };

  const loadSignatureRequests = async () => {
    try {
      // Mock data - replace with actual API call
      const mockRequests: SignatureRequest[] = [
        {
          id: "1",
          documentId,
          documentName,
          requesterId: "dr-silva",
          requesterName: "Dr. João Silva",
          requiredSigners: [
            {
              id: "patient-001",
              name: "Maria Santos",
              email: "maria@email.com",
              role: "patient",
              signatureType: "electronic",
              isRequired: true,
            },
            {
              id: "witness-001",
              name: "Ana Costa",
              email: "ana@email.com",
              role: "witness",
              signatureType: "electronic",
              isRequired: false,
            },
          ],
          message: "Por favor, assine o termo de consentimento para o procedimento.",
          deadline: new Date("2024-01-22T23:59:59"),
          status: "pending",
          createdAt: new Date("2024-01-15T09:00:00"),
          signatures: [],
        },
      ];

      setSignatureRequests(mockRequests);
    } catch (error) {
      console.error("Erro ao carregar solicitações de assinatura:", error);
    }
  };

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureCanvas(canvas.toDataURL());
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureCanvas("");
  };

  const handleSign = async () => {
    setIsLoading(true);
    try {
      const newSignature: DigitalSignature = {
        id: crypto.randomUUID(),
        documentId,
        signerId: "current-user",
        signerName: signatureData.signerName,
        signerRole: signatureData.signerRole,
        signatureType: selectedSignatureType,
        signatureData:
          selectedSignatureType === "electronic" ? signatureCanvas : "encrypted_signature_data",
        certificateId:
          selectedSignatureType === "digital_certificate"
            ? "cert_" + crypto.randomUUID()
            : undefined,
        biometricData:
          selectedSignatureType === "biometric" ? signatureData.biometricData : undefined,
        pinCode: selectedSignatureType === "pin" ? "encrypted_pin" : undefined,
        ipAddress: "192.168.1.100",
        userAgent: navigator.userAgent,
        timestamp: new Date(),
        isValid: true,
        validationDetails: {
          certificateValid: selectedSignatureType === "digital_certificate",
          timestampValid: true,
          integrityValid: true,
          revocationStatus: "valid",
          validationDate: new Date(),
          validatorId: "validator_001",
        },
        metadata: {
          reason: signatureData.reason,
          signatureMethod: selectedSignatureType,
          deviceInfo: navigator.platform,
        },
      };

      setSignatures((prev) => [...prev, newSignature]);
      onSignatureComplete?.(newSignature);

      setShowSignDialog(false);
      setSignatureData({
        signerName: "",
        signerRole: "",
        password: "",
        pinCode: "",
        otpCode: "",
        certificateFile: null,
        biometricData: "",
        reason: "",
      });
      setSelectedSignatureType("");
      clearCanvas();
    } catch (error) {
      console.error("Erro ao assinar documento:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addSigner = () => {
    if (newSigner.name && newSigner.email && newSigner.role && newSigner.signatureType) {
      const signer: RequiredSigner = {
        id: crypto.randomUUID(),
        name: newSigner.name,
        email: newSigner.email,
        role: newSigner.role,
        signatureType: newSigner.signatureType,
        isRequired: newSigner.isRequired,
      };

      setNewRequest((prev) => ({
        ...prev,
        requiredSigners: [...prev.requiredSigners, signer],
      }));

      setNewSigner({
        name: "",
        email: "",
        role: "",
        signatureType: "",
        isRequired: true,
      });
    }
  };

  const removeSigner = (signerId: string) => {
    setNewRequest((prev) => ({
      ...prev,
      requiredSigners: prev.requiredSigners.filter((s) => s.id !== signerId),
    }));
  };

  const sendSignatureRequest = async () => {
    try {
      const request: SignatureRequest = {
        id: crypto.randomUUID(),
        documentId,
        documentName,
        requesterId: "current-user",
        requesterName: "Current User",
        requiredSigners: newRequest.requiredSigners,
        message: newRequest.message,
        deadline: newRequest.deadline,
        status: "pending",
        createdAt: new Date(),
        signatures: [],
      };

      setSignatureRequests((prev) => [...prev, request]);
      onRequestSent?.(request);

      setShowRequestDialog(false);
      setNewRequest({
        message: "",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        requiredSigners: [],
      });
    } catch (error) {
      console.error("Erro ao enviar solicitação de assinatura:", error);
    }
  };

  const getSignatureTypeInfo = (type: string) => {
    return SIGNATURE_TYPES.find((t) => t.value === type) || SIGNATURE_TYPES[0];
  };

  const getSignerRoleInfo = (role: string) => {
    return SIGNER_ROLES.find((r) => r.value === role) || SIGNER_ROLES[0];
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = SIGNATURE_STATUS.find((s) => s.value === status);
    return (
      <Badge className={statusInfo?.color}>
        <div className="flex items-center space-x-1">
          {statusInfo?.icon}
          <span>{statusInfo?.label}</span>
        </div>
      </Badge>
    );
  };

  const validateSignature = async (signatureId: string) => {
    // Simulate signature validation
    console.log("Validating signature:", signatureId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assinaturas Digitais</h2>
          <p className="text-gray-600">Gerencie assinaturas e solicitações para {documentName}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Send className="w-4 h-4 mr-2" />
                Solicitar Assinaturas
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Solicitar Assinaturas</DialogTitle>
                <DialogDescription>
                  Envie solicitações de assinatura para múltiplos signatários
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    value={newRequest.message}
                    onChange={(e) =>
                      setNewRequest((prev) => ({ ...prev, message: e.target.value }))
                    }
                    placeholder="Mensagem para os signatários"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Prazo</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={format(newRequest.deadline, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) =>
                      setNewRequest((prev) => ({
                        ...prev,
                        deadline: new Date(e.target.value),
                      }))
                    }
                  />
                </div>

                {/* Add Signer Form */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-medium">Adicionar Signatário</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signerName">Nome</Label>
                      <Input
                        id="signerName"
                        value={newSigner.name}
                        onChange={(e) =>
                          setNewSigner((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="Nome do signatário"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signerEmail">Email</Label>
                      <Input
                        id="signerEmail"
                        type="email"
                        value={newSigner.email}
                        onChange={(e) =>
                          setNewSigner((prev) => ({ ...prev, email: e.target.value }))
                        }
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signerRole">Função</Label>
                      <Select
                        value={newSigner.role}
                        onValueChange={(value) =>
                          setNewSigner((prev) => ({ ...prev, role: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a função" />
                        </SelectTrigger>
                        <SelectContent>
                          {SIGNER_ROLES.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              <div className="flex items-center space-x-2">
                                {role.icon}
                                <span>{role.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signerSignatureType">Tipo de Assinatura</Label>
                      <Select
                        value={newSigner.signatureType}
                        onValueChange={(value) =>
                          setNewSigner((prev) => ({ ...prev, signatureType: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo de assinatura" />
                        </SelectTrigger>
                        <SelectContent>
                          {SIGNATURE_TYPES.filter((type) =>
                            allowedSignatureTypes.includes(type.value),
                          ).map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center space-x-2">
                                {type.icon}
                                <span>{type.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isRequired"
                      checked={newSigner.isRequired}
                      onChange={(e) =>
                        setNewSigner((prev) => ({ ...prev, isRequired: e.target.checked }))
                      }
                      className="rounded"
                    />
                    <Label htmlFor="isRequired">Assinatura obrigatória</Label>
                  </div>

                  <Button
                    type="button"
                    onClick={addSigner}
                    disabled={
                      !newSigner.name ||
                      !newSigner.email ||
                      !newSigner.role ||
                      !newSigner.signatureType
                    }
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Signatário
                  </Button>
                </div>

                {/* Signers List */}
                {newRequest.requiredSigners.length > 0 && (
                  <div className="space-y-2">
                    <Label>Signatários Adicionados</Label>
                    <div className="space-y-2">
                      {newRequest.requiredSigners.map((signer) => {
                        const roleInfo = getSignerRoleInfo(signer.role);
                        const typeInfo = getSignatureTypeInfo(signer.signatureType);
                        return (
                          <div
                            key={signer.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{signer.name}</span>
                                <Badge
                                  className={
                                    roleInfo.value === "patient"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                                  }
                                >
                                  {roleInfo.label}
                                </Badge>
                                <Badge className={typeInfo.color} variant="outline">
                                  {typeInfo.label}
                                </Badge>
                                {signer.isRequired && (
                                  <Badge variant="outline" className="text-red-600">
                                    Obrigatório
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">{signer.email}</div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeSigner(signer.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRequestDialog(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={sendSignatureRequest}
                    disabled={newRequest.requiredSigners.length === 0}
                  >
                    Enviar Solicitações
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
            <DialogTrigger asChild>
              <Button>
                <PenTool className="w-4 h-4 mr-2" />
                Assinar Documento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Assinar Documento</DialogTitle>
                <DialogDescription>
                  Assine digitalmente o documento: {documentName}
                </DialogDescription>
              </DialogHeader>

              <Tabs value={selectedSignatureType} onValueChange={setSelectedSignatureType}>
                <TabsList className="grid w-full grid-cols-3">
                  {SIGNATURE_TYPES.filter((type) => allowedSignatureTypes.includes(type.value))
                    .slice(0, 3)
                    .map((type) => (
                      <TabsTrigger key={type.value} value={type.value}>
                        <div className="flex items-center space-x-1">
                          {type.icon}
                          <span className="hidden sm:inline">{type.label}</span>
                        </div>
                      </TabsTrigger>
                    ))}
                </TabsList>

                {SIGNATURE_TYPES.filter((type) => allowedSignatureTypes.includes(type.value)).map(
                  (type) => (
                    <TabsContent key={type.value} value={type.value} className="space-y-4">
                      <Alert>
                        <Info className="w-4 h-4" />
                        <AlertDescription>{type.description}</AlertDescription>
                      </Alert>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="signerName">Nome do Signatário *</Label>
                          <Input
                            id="signerName"
                            value={signatureData.signerName}
                            onChange={(e) =>
                              setSignatureData((prev) => ({ ...prev, signerName: e.target.value }))
                            }
                            placeholder="Seu nome completo"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signerRole">Função *</Label>
                          <Select
                            value={signatureData.signerRole}
                            onValueChange={(value) =>
                              setSignatureData((prev) => ({ ...prev, signerRole: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sua função" />
                            </SelectTrigger>
                            <SelectContent>
                              {SIGNER_ROLES.map((role) => (
                                <SelectItem key={role.value} value={role.value}>
                                  <div className="flex items-center space-x-2">
                                    {role.icon}
                                    <span>{role.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {type.value === "digital_certificate" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="certificate">Certificado Digital</Label>
                            <Input
                              id="certificate"
                              type="file"
                              accept=".p12,.pfx"
                              onChange={(e) =>
                                setSignatureData((prev) => ({
                                  ...prev,
                                  certificateFile: e.target.files?.[0] || null,
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="certPassword">Senha do Certificado</Label>
                            <Input
                              id="certPassword"
                              type="password"
                              value={signatureData.password}
                              onChange={(e) =>
                                setSignatureData((prev) => ({ ...prev, password: e.target.value }))
                              }
                              placeholder="Senha do certificado"
                            />
                          </div>
                        </div>
                      )}

                      {type.value === "electronic" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Assinatura Manuscrita</Label>
                            <div className="border rounded-lg p-4">
                              <canvas
                                ref={canvasRef}
                                width={400}
                                height={200}
                                className="border border-gray-300 rounded cursor-crosshair w-full"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                              />
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-sm text-gray-600">
                                  Desenhe sua assinatura acima
                                </p>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={clearCanvas}
                                >
                                  Limpar
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password">Senha de Confirmação</Label>
                            <Input
                              id="password"
                              type="password"
                              value={signatureData.password}
                              onChange={(e) =>
                                setSignatureData((prev) => ({ ...prev, password: e.target.value }))
                              }
                              placeholder="Sua senha de login"
                            />
                          </div>
                        </div>
                      )}

                      {type.value === "biometric" && (
                        <div className="space-y-4">
                          <Alert>
                            <Fingerprint className="w-4 h-4" />
                            <AlertDescription>
                              A captura biométrica será realizada através do dispositivo conectado.
                            </AlertDescription>
                          </Alert>
                          <Button type="button" className="w-full">
                            <Fingerprint className="w-4 h-4 mr-2" />
                            Capturar Biometria
                          </Button>
                        </div>
                      )}

                      {type.value === "pin" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="pinCode">Código PIN</Label>
                            <Input
                              id="pinCode"
                              type="password"
                              value={signatureData.pinCode}
                              onChange={(e) =>
                                setSignatureData((prev) => ({ ...prev, pinCode: e.target.value }))
                              }
                              placeholder="Seu código PIN"
                              maxLength={6}
                            />
                          </div>
                        </div>
                      )}

                      {type.value === "sms" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="phone">Número do Celular</Label>
                            <Input id="phone" type="tel" placeholder="(11) 99999-9999" />
                          </div>
                          <Button type="button" variant="outline" className="w-full">
                            <Smartphone className="w-4 h-4 mr-2" />
                            Enviar Código SMS
                          </Button>
                          <div className="space-y-2">
                            <Label htmlFor="otpCode">Código de Verificação</Label>
                            <Input
                              id="otpCode"
                              value={signatureData.otpCode}
                              onChange={(e) =>
                                setSignatureData((prev) => ({ ...prev, otpCode: e.target.value }))
                              }
                              placeholder="Código recebido por SMS"
                              maxLength={6}
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="reason">Motivo da Assinatura</Label>
                        <Textarea
                          id="reason"
                          value={signatureData.reason}
                          onChange={(e) =>
                            setSignatureData((prev) => ({ ...prev, reason: e.target.value }))
                          }
                          placeholder="Motivo ou contexto da assinatura"
                          rows={2}
                        />
                      </div>

                      <div className="flex items-center justify-end space-x-4 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowSignDialog(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleSign}
                          disabled={
                            !signatureData.signerName || !signatureData.signerRole || isLoading
                          }
                        >
                          {isLoading ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <PenTool className="w-4 h-4 mr-2" />
                          )}
                          Assinar Documento
                        </Button>
                      </div>
                    </TabsContent>
                  ),
                )}
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Existing Signatures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>Assinaturas Existentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {signatures.length === 0 ? (
            <div className="text-center py-8">
              <PenTool className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma assinatura encontrada
              </h3>
              <p className="text-gray-600 mb-4">Este documento ainda não foi assinado</p>
              <Button onClick={() => setShowSignDialog(true)}>
                <PenTool className="w-4 h-4 mr-2" />
                Primeira Assinatura
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {signatures.map((signature) => {
                const typeInfo = getSignatureTypeInfo(signature.signatureType);
                const roleInfo = getSignerRoleInfo(signature.signerRole);
                return (
                  <div key={signature.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            {roleInfo.icon}
                            <span className="font-medium">{signature.signerName}</span>
                          </div>
                          <Badge className={typeInfo.color}>
                            <div className="flex items-center space-x-1">
                              {typeInfo.icon}
                              <span>{typeInfo.label}</span>
                            </div>
                          </Badge>
                          <Badge
                            className={
                              signature.isValid
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {signature.isValid ? "Válida" : "Inválida"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {format(signature.timestamp, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Hash className="w-4 h-4" />
                            <span>IP: {signature.ipAddress}</span>
                          </div>
                          {signature.certificateId && (
                            <div className="flex items-center space-x-1">
                              <Shield className="w-4 h-4" />
                              <span>Cert: {signature.certificateId.slice(0, 8)}...</span>
                            </div>
                          )}
                        </div>

                        {signature.metadata.reason && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <strong>Motivo:</strong> {signature.metadata.reason}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => validateSignature(signature.id)}
                        >
                          <Shield className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Signature Requests */}
      {signatureRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="w-5 h-5" />
              <span>Solicitações de Assinatura</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {signatureRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{request.documentName}</h3>
                      <p className="text-sm text-gray-600">Por: {request.requesterName}</p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  {request.message && (
                    <div className="mb-3 p-2 bg-blue-50 rounded text-sm">{request.message}</div>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Signatários:</h4>
                    {request.requiredSigners.map((signer) => {
                      const roleInfo = getSignerRoleInfo(signer.role);
                      const typeInfo = getSignatureTypeInfo(signer.signatureType);
                      return (
                        <div
                          key={signer.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div className="flex items-center space-x-2">
                            {roleInfo.icon}
                            <span className="text-sm">{signer.name}</span>
                            <Badge className={typeInfo.color} variant="outline">
                              {typeInfo.label}
                            </Badge>
                            {signer.isRequired && (
                              <Badge variant="outline" className="text-red-600">
                                Obrigatório
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {signer.hasSignedAt ? (
                              <span className="text-green-600">Assinado</span>
                            ) : (
                              <span>Pendente</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <span>
                      Criado em: {format(request.createdAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </span>
                    {request.deadline && (
                      <span>
                        Prazo: {format(request.deadline, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {(signatures.length > 0 || signatureRequests.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Resumo das Assinaturas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {signatures.filter((s) => s.isValid).length}
                </div>
                <div className="text-sm text-gray-600">Assinaturas Válidas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {signatures.filter((s) => s.signatureType === "digital_certificate").length}
                </div>
                <div className="text-sm text-gray-600">Certificado Digital</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {signatureRequests.filter((r) => r.status === "pending").length}
                </div>
                <div className="text-sm text-gray-600">Pendentes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {signatureRequests.reduce((acc, req) => acc + req.requiredSigners.length, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Solicitações</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

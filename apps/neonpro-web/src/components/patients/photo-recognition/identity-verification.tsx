"use client";

/**
 * Identity Verification Component
 * Handles patient identity verification through facial recognition
 *
 * @author APEX Master Developer
 */

import React, { useState, useRef, useCallback } from "react";
import type { Camera, Shield, AlertTriangle, CheckCircle, X, Loader2, Eye } from "lucide-react";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Progress } from "@/components/ui/progress";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Label } from "@/components/ui/label";
import type { useToast } from "@/components/ui/use-toast";
import type { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface IdentityVerificationProps {
  patientId: string;
  patientName: string;
  onVerificationComplete?: (result: VerificationResult) => void;
  onVerificationError?: (error: string) => void;
  requiredConfidence?: number;
}

interface VerificationResult {
  verified: boolean;
  confidence: number;
  matchedPhotos: Array<{
    id: string;
    type: string;
    confidence: number;
    uploadedAt: string;
  }>;
  verificationId: string;
  timestamp: string;
  recommendations: string[];
}

const VERIFICATION_CONTEXTS = [
  { value: "identity_check", label: "Verificação de Identidade" },
  { value: "appointment_checkin", label: "Check-in de Consulta" },
  { value: "treatment_authorization", label: "Autorização de Tratamento" },
  { value: "document_access", label: "Acesso a Documentos" },
  { value: "payment_authorization", label: "Autorização de Pagamento" },
];

export function IdentityVerification({
  patientId,
  patientName,
  onVerificationComplete,
  onVerificationError,
  requiredConfidence = 0.8,
}: IdentityVerificationProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [verificationContext, setVerificationContext] = useState<string>("identity_check");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isUsingCamera, setIsUsingCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleFileSelect = useCallback(
    (file: File) => {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Apenas arquivos JPEG, PNG e WebP são permitidos.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB max for verification)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 5MB para verificação.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      setVerificationResult(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    },
    [toast],
  );

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });

      setStream(mediaStream);
      setIsUsingCamera(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast({
        title: "Erro ao acessar câmera",
        description: "Não foi possível acessar a câmera. Verifique as permissões.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsUsingCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], "verification-photo.jpg", { type: "image/jpeg" });
          handleFileSelect(file);
          stopCamera();
        }
      },
      "image/jpeg",
      0.9,
    );
  };

  const verifyIdentity = async () => {
    if (!selectedFile) return;

    setIsVerifying(true);
    setVerificationProgress(0);

    try {
      const formData = new FormData();
      formData.append("photo", selectedFile);
      formData.append("patientId", patientId);
      formData.append("context", verificationContext);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setVerificationProgress((prev) => Math.min(prev + 15, 90));
      }, 300);

      const response = await fetch("/api/patients/photos/verify", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("supabase_token")}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setVerificationProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Verification failed");
      }

      const result = await response.json();
      setVerificationResult(result.data);

      const isVerified = result.data.verified && result.data.confidence >= requiredConfidence;

      toast({
        title: isVerified ? "Identidade verificada!" : "Verificação falhou",
        description: `Confiança: ${Math.round(result.data.confidence * 100)}%`,
        variant: isVerified ? "default" : "destructive",
      });

      onVerificationComplete?.(result.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro na verificação",
        description: errorMessage,
        variant: "destructive",
      });
      onVerificationError?.(errorMessage);
    } finally {
      setIsVerifying(false);
      setVerificationProgress(0);
    }
  };

  const resetVerification = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setVerificationResult(null);
    setVerificationProgress(0);
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-600";
    if (confidence >= 0.7) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) return "default";
    if (confidence >= 0.7) return "secondary";
    return "destructive";
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Verificação de Identidade - {patientName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Verification Context */}
        <div className="space-y-2">
          <Label htmlFor="verification-context">Contexto da Verificação</Label>
          <Select value={verificationContext} onValueChange={setVerificationContext}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o contexto" />
            </SelectTrigger>
            <SelectContent>
              {VERIFICATION_CONTEXTS.map((context) => (
                <SelectItem key={context.value} value={context.value}>
                  {context.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Camera or File Upload */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={isUsingCamera ? "default" : "outline"}
              onClick={isUsingCamera ? stopCamera : startCamera}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              {isUsingCamera ? "Parar Câmera" : "Usar Câmera"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              Selecionar Arquivo
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Camera View */}
        {isUsingCamera && (
          <div className="space-y-4">
            <div className="relative max-w-md mx-auto">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-auto rounded-lg shadow-md"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <Button type="button" onClick={capturePhoto} className="w-full">
              <Camera className="h-4 w-4 mr-2" />
              Capturar Foto
            </Button>
          </div>
        )}

        {/* Preview */}
        {previewUrl && !isUsingCamera && (
          <div className="space-y-2">
            <Label>Foto para Verificação</Label>
            <div className="relative max-w-md mx-auto">
              <img
                src={previewUrl}
                alt="Verification photo"
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>
          </div>
        )}

        {/* Verification Progress */}
        {isVerifying && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Verificando identidade...</Label>
              <span className="text-sm text-gray-500">{verificationProgress}%</span>
            </div>
            <Progress value={verificationProgress} className="w-full" />
          </div>
        )}

        {/* Verification Result */}
        {verificationResult && (
          <Alert
            className={
              verificationResult.verified
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }
          >
            {verificationResult.verified ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {verificationResult.verified ? "Identidade Verificada" : "Verificação Falhou"}
                  </span>
                  <Badge variant={getConfidenceBadge(verificationResult.confidence)}>
                    {Math.round(verificationResult.confidence * 100)}% confiança
                  </Badge>
                </div>

                {verificationResult.matchedPhotos.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Fotos correspondentes:</p>
                    <div className="space-y-1">
                      {verificationResult.matchedPhotos.map((photo, index) => (
                        <div key={photo.id} className="flex items-center justify-between text-sm">
                          <span>
                            {photo.type} - {new Date(photo.uploadedAt).toLocaleDateString()}
                          </span>
                          <Badge variant="outline" className={getConfidenceColor(photo.confidence)}>
                            {Math.round(photo.confidence * 100)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {verificationResult.recommendations.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Recomendações:</p>
                    <ul className="text-sm list-disc list-inside space-y-1">
                      {verificationResult.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={verifyIdentity}
            disabled={!selectedFile || isVerifying}
            className="flex-1"
            variant={verificationResult?.verified ? "default" : "default"}
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Verificar Identidade
              </>
            )}
          </Button>

          {selectedFile && (
            <Button
              type="button"
              variant="outline"
              onClick={resetVerification}
              disabled={isVerifying}
            >
              <X className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

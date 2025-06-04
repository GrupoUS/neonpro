import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase"; // Ajustado o caminho

interface AudioRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  disabled?: boolean;
}

const AudioRecorder = ({ onTranscriptionComplete, disabled }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const logStep = (step: string, details?: unknown) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [AUDIO-RECORDER] ${step}`, details || '');
  };

  const startRecording = async () => {
    try {
      logStep("Starting recording");
      
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Gravação de áudio não suportada neste navegador");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // Whisper prefere 16kHz
          channelCount: 1
        } 
      });
      
      logStep("Microphone access granted");

      // Testar formatos suportados - priorizar WAV e WebM
      const testFormats = [
        'audio/wav',
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg'
      ];

      let selectedFormat = '';
      for (const format of testFormats) {
        if (MediaRecorder.isTypeSupported(format)) {
          selectedFormat = format;
          break;
        }
      }

      if (!selectedFormat) {
        selectedFormat = 'audio/webm'; // Fallback padrão
      }

      logStep("Using audio format", { format: selectedFormat });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedFormat,
        audioBitsPerSecond: 128000 // 128kbps para qualidade adequada
      });
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
          logStep("Audio chunk received", { size: event.data.size });
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: selectedFormat });
        logStep("Recording completed", { 
          blobSize: blob.size,
          duration: recordingTime,
          chunks: chunks.length,
          mimeType: blob.type
        });
        setAudioBlob(blob);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.onerror = (event: Event) => {
        logStep("MediaRecorder error", event);
        toast({
          title: "Erro de Gravação",
          description: "Falha durante a gravação",
          variant: "destructive"
        });
      };
      
      mediaRecorder.start(250); // Coletar dados a cada 250ms para melhor qualidade
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);
      
      // Timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 180) { // 3 minutos max para evitar arquivos muito grandes
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      
      logStep("Recording started successfully");
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logStep("Failed to start recording", { error: errorMessage });
      
      let displayMessage = "Erro ao iniciar gravação";
      if (errorMessage.includes("Permission denied") || errorMessage.includes("NotAllowedError")) {
        displayMessage = "Permissão de microfone negada. Verifique as configurações do navegador.";
      }
      
      toast({
        title: "Erro",
        description: displayMessage,
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    logStep("Stopping recording");
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const discardRecording = () => {
    logStep("Discarding recording");
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const sendRecording = async () => {
    if (!audioBlob) return;
    
    logStep("Starting transcription", { 
      blobSize: audioBlob.size,
      blobType: audioBlob.type 
    });
    setIsProcessing(true);
    
    try {
      // Validações
      if (audioBlob.size > 25 * 1024 * 1024) {
        throw new Error("Arquivo muito grande (máx: 25MB)");
      }

      if (audioBlob.size < 1000) {
        throw new Error("Gravação muito pequena. Tente novamente.");
      }

      // Converter para base64 com melhor tratamento
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          logStep("FileReader completed", { 
            resultLength: result.length,
            hasDataPrefix: result.includes('data:')
          });
          resolve(result);
        };
        reader.onerror = () => {
          logStep("FileReader error", { error: reader.error });
          reject(new Error("Erro ao processar áudio"));
        };
        reader.readAsDataURL(audioBlob);
      });
      
      logStep("Audio converted to base64", { 
        originalSize: audioBlob.size,
        base64Length: base64Audio.length,
        mimeType: audioBlob.type
      });
      
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { audio: base64Audio }
      });
      
      logStep("Transcription response", { 
        hasData: !!data, 
        hasError: !!error,
        data: data ? Object.keys(data) : null
      });
      
      if (error) {
        logStep("Supabase function error", { error });
        throw new Error(`Erro na transcrição: ${error.message}`);
      }
      
      if (!data?.success) {
        logStep("Transcription failed", { error: data?.error });
        throw new Error(data?.error || "Falha na transcrição");
      }
      
      if (!data.transcribed_text) {
        logStep("Empty transcription result");
        throw new Error("Nenhum texto foi transcrito");
      }
      
      logStep("Transcription successful", { 
        textLength: data.transcribed_text.length,
        preview: data.transcribed_text.substring(0, 50)
      });
      
      onTranscriptionComplete(data.transcribed_text);
      setAudioBlob(null);
      setRecordingTime(0);
      
      toast({
        title: "Sucesso",
        description: "Áudio transcrito com sucesso!",
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logStep("Transcription failed", { error: errorMessage });
      
      toast({
        title: "Erro na Transcrição",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Interface de revisão da gravação
  if (audioBlob) {
    const sizeKB = Math.round(audioBlob.size / 1024);
    
    return (
      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border">
        <div className="flex-1">
          <div className="text-sm font-medium">
            Gravação de {formatTime(recordingTime)}
          </div>
          <div className="text-xs text-muted-foreground">
            {sizeKB}KB • {audioBlob.type}
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={discardRecording}
          disabled={isProcessing}
        >
          <X className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          onClick={sendRecording}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Send className="h-3 w-3" />
          )}
        </Button>
      </div>
    );
  }

  // Interface durante gravação
  if (isRecording) {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm text-red-700 dark:text-red-300 font-medium">
            Gravando... {formatTime(recordingTime)}
          </span>
        </div>
        <Button
          size="sm"
          variant="destructive"
          onClick={stopRecording}
        >
          <MicOff className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  // Botão inicial
  return (
    <Button
      size="icon"
      variant="outline"
      onClick={startRecording}
      disabled={disabled}
      className="h-10 w-10"
    >
      <Mic className="h-4 w-4" />
    </Button>
  );
};

export default AudioRecorder;

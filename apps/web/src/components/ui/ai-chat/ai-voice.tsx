'use client';

import { cn } from '@neonpro/ui';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import type { AIVoiceProps } from './types';

/**
 * AI Voice Component for NeonPro Aesthetic Clinic
 * Voice input/output with accessibility and aesthetic clinic styling
 */
export default function AIVoice({
  onVoiceInput,
  onVoiceOutput,
  isListening = false,
  isPlaying = false,
  disabled = false,
  className,
}: AIVoiceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasAudioSupport] = useState(() => {
    if (typeof window === 'undefined') return false;
    const hasMediaDevices = !!navigator?.mediaDevices?.getUserMedia;
    const hasRecorder = typeof MediaRecorder !== 'undefined';
    // Se quiser manter a checagem opcional de STT:
    // const hasSTT = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    return hasMediaDevices && hasRecorder;
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const handleMicToggle = useCallback(async () => {
    if (!hasAudioSupport || disabled) return;

    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        const audioChunks: Blob[] = [];

        mediaRecorder.ondataavailable = event => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const mimeType = mediaRecorder.mimeType || audioChunks[0]?.type || 'audio/webm';
          const audioBlob = new Blob(audioChunks, { type: mimeType });
          onVoiceInput?.(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (_error) {
        console.error('Erro ao acessar microfone:', error);
      }
    }
  }, [hasAudioSupport, disabled, isRecording, onVoiceInput]);
  const handleSpeakerToggle = useCallback(() => {
    if (disabled) return;
    onVoiceOutput?.();
  }, [disabled, onVoiceOutput]);

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {/* Microphone Button */}
      <button
        onClick={handleMicToggle}
        disabled={disabled || !hasAudioSupport}
        className={cn(
          'flex items-center justify-center rounded-full p-3',
          'border-2 transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isRecording || isListening
            ? 'bg-[#AC9469] border-[#AC9469] text-white'
            : 'bg-white border-[#D2D0C8] text-[#294359] hover:border-[#294359]',
          'focus:outline-none focus:ring-2 focus:ring-[#294359]/20',
        )}
        aria-label={isRecording ? 'Parar gravação' : 'Iniciar gravação de voz'}
        aria-pressed={isRecording}
      >
        {isRecording || isListening ? <MicOff className='h-5 w-5' /> : <Mic className='h-5 w-5' />}
      </button>

      {/* Speaker Button */}
      <button
        onClick={handleSpeakerToggle}
        disabled={disabled}
        className={cn(
          'flex items-center justify-center rounded-full p-3',
          'border-2 transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isPlaying
            ? 'bg-[#AC9469] border-[#AC9469] text-white'
            : 'bg-white border-[#D2D0C8] text-[#294359] hover:border-[#294359]',
          'focus:outline-none focus:ring-2 focus:ring-[#294359]/20',
        )}
        aria-label={isPlaying ? 'Pausar áudio' : 'Reproduzir resposta'}
        aria-pressed={isPlaying}
      >
        {isPlaying ? <VolumeX className='h-5 w-5' /> : <Volume2 className='h-5 w-5' />}
      </button>

      {/* Status Indicators */}
      {isRecording && (
        <div className='flex items-center space-x-1'>
          <div className='h-2 w-2 rounded-full bg-red-500 animate-pulse' />
          <span className='text-xs text-[#B4AC9C]'>Gravando...</span>
        </div>
      )}

      {!hasAudioSupport && <span className='text-xs text-[#B4AC9C]'>Áudio não suportado</span>}
    </div>
  );
}

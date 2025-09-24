import { AlertCircle, Camera, Check, Clock, Download, FlipHorizontal, User, X } from 'lucide-react';
import * as React from 'react';

interface CameraConfig {
  facingMode?: 'user' | 'environment';
  resolution?: {
    width: number;
    height: number;
  };
  flash?: boolean;
}

interface PhotoMetadata {
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  patientId?: string;
  procedureType: string;
  beforeAfter: 'before' | 'after';
  notes?: string;
  professionalId: string;
}

interface PWACameraCaptureProps {
  className?: string;
  patientId?: string;
  procedureType?: string;
  onCapture?: (photoData: string, metadata: PhotoMetadata) => void;
  onClose?: () => void;
  showControls?: boolean;
}

export const PWACameraCapture: React.FC<PWACameraCaptureProps> = ({
  className,
  patientId,
  procedureType = 'Geral',
  onCapture,
  onClose,
  showControls = true,
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [isActive, setIsActive] = React.useState(false);
  const [capturedPhoto, setCapturedPhoto] = React.useState<string | null>(null);
  const [facingMode, setFacingMode] = React.useState<'user' | 'environment'>('environment');
  const [flashEnabled, setFlashEnabled] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [photoMode, setPhotoMode] = React.useState<'before' | 'after'>('before');
  const [notes, setNotes] = React.useState('');
  const [showMetadata, setShowMetadata] = React.useState(false);

  const initCamera = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        setStream(mediaStream);
        setIsActive(true);
      }
    } catch (err) {
      console.error('Camera initialization error:', err);
      setError('Não foi possível acessar a câmera. Verifique as permissões.');
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsActive(false);
  };

  const switchCamera = async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);

    if (isActive) {
      stopCamera();
      setTimeout(initCamera, 100);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to data URL
    const photoData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPhoto(photoData);
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setNotes('');
    setShowMetadata(false);
  };

  const savePhoto = async () => {
    if (!capturedPhoto) return;

    const metadata: PhotoMetadata = {
      timestamp: new Date(),
      patientId,
      procedureType,
      beforeAfter: photoMode,
      notes: notes.trim() || undefined,
      professionalId: 'current-user', // This should come from auth context
    };

    // Get location if available and permitted
    try {
      if ('geolocation' in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        metadata.location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
      }
    } catch {
      // Location access denied or unavailable
    }

    onCapture?.(capturedPhoto, metadata);

    // Reset for next photo
    retakePhoto();
  };

  const downloadPhoto = () => {
    if (!capturedPhoto) return;

    const link = document.createElement('a');
    link.download = `neonpro-${procedureType}-${photoMode}-${Date.now()}.jpg`;
    link.href = capturedPhoto;
    link.click();
  };

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (!isActive && !capturedPhoto) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className='text-center'>
          <Camera className='mx-auto h-12 w-12 text-gray-400 mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Câmera para Procedimentos Estéticos
          </h3>
          <p className='text-sm text-gray-500 mb-6'>
            Capture fotos de antes e depois para documentação clínica
          </p>

          {error && (
            <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-md'>
              <div className='flex items-center'>
                <AlertCircle className='h-4 w-4 text-red-400 mr-2' />
                <span className='text-sm text-red-800'>{error}</span>
              </div>
            </div>
          )}

          <button
            onClick={initCamera}
            disabled={isLoading}
            className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
          >
            {isLoading
              ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'>
                  </div>
                  Inicializando câmera...
                </>
              )
              : (
                <>
                  <Camera className='h-4 w-4 mr-2' />
                  Iniciar Câmera
                </>
              )}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className='w-full mt-3 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200'
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    );
  }

  if (capturedPhoto) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-medium text-gray-900'>
            Foto Capturada - {photoMode === 'before' ? 'Antes' : 'Depois'}
          </h3>
          <div className='flex items-center space-x-2'>
            <button
              onClick={retakePhoto}
              className='p-2 text-gray-400 hover:text-gray-600'
            >
              <X className='h-5 w-5' />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className='p-2 text-gray-400 hover:text-gray-600'
              >
                <X className='h-5 w-5' />
              </button>
            )}
          </div>
        </div>

        <div className='mb-4'>
          <img
            src={capturedPhoto}
            alt={`Foto ${photoMode === 'before' ? 'antes' : 'depois'} do procedimento`}
            className='w-full rounded-lg'
          />
        </div>

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-gray-700'>
              Tipo de Foto:
            </span>
            <div className='flex items-center space-x-2'>
              <button
                onClick={() => setPhotoMode('before')}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  photoMode === 'before'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Antes
              </button>
              <button
                onClick={() => setPhotoMode('after')}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  photoMode === 'after'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Depois
              </button>
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Notas Clínicas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder='Adicione observações sobre o procedimento, condições da pele, etc.'
              className='w-full p-2 border border-gray-300 rounded-md text-sm'
              rows={3}
            />
          </div>

          <div className='flex items-center justify-between pt-4 border-t'>
            <button
              onClick={downloadPhoto}
              className='flex items-center px-3 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200'
            >
              <Download className='h-4 w-4 mr-2' />
              Baixar
            </button>

            <button
              onClick={savePhoto}
              className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
            >
              <Check className='h-4 w-4 mr-2' />
              Salvar no Sistema
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-black rounded-lg overflow-hidden ${className}`}>
      {/* Camera View */}
      <div className='relative'>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className='w-full h-auto'
        />

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className='hidden' />

        {/* Camera Controls */}
        {showControls && (
          <div className='absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent'>
            <div className='flex items-center justify-between'>
              <button
                onClick={switchCamera}
                className='p-3 text-white bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-sm'
              >
                <FlipHorizontal className='h-6 w-6' />
              </button>

              <button
                onClick={capturePhoto}
                className='p-4 text-white bg-white rounded-full hover:bg-white/90'
              >
                <Camera className='h-8 w-8' />
              </button>

              <button
                onClick={() => setFlashEnabled(!flashEnabled)}
                className={`p-3 rounded-full backdrop-blur-sm ${
                  flashEnabled
                    ? 'text-yellow-300 bg-yellow-500/30'
                    : 'text-white bg-white/20 hover:bg-white/30'
                }`}
              >
                <div className='w-6 h-6 bg-white rounded-sm' />
              </button>
            </div>
          </div>
        )}

        {/* Mode Indicator */}
        <div className='absolute top-4 left-4'>
          <div className='bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full'>
            <span className='text-white text-xs font-medium'>
              {photoMode === 'before' ? 'ANTES' : 'DEPOIS'}
            </span>
          </div>
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className='absolute top-4 right-4 p-2 text-white bg-black/50 rounded-full hover:bg-black/70 backdrop-blur-sm'
          >
            <X className='h-5 w-5' />
          </button>
        )}
      </div>
    </div>
  );
};

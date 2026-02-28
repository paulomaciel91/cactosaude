import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWebRTC } from '@/hooks/useWebRTC';
import { Video, VideoOff, Mic, MicOff, MonitorUp, PhoneOff, Users } from 'lucide-react';
import { toast } from 'sonner';

interface WebRTCVideoCallProps {
  roomId: string;
  patientName?: string;
  onEndCall?: () => void;
  callDuration?: string;
}

export const WebRTCVideoCall = ({ roomId, patientName, onEndCall, callDuration }: WebRTCVideoCallProps) => {
  const {
    localStream,
    remoteStream,
    isConnected,
    isCallActive,
    error,
    startCall,
    endCall,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    isMicEnabled,
    isCameraEnabled,
    isScreenSharing,
  } = useWebRTC(roomId);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Conectar vídeo local ao elemento
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Conectar vídeo remoto ao elemento
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Iniciar chamada automaticamente quando componente montar
  useEffect(() => {
    if (!isCallActive && !error) {
      startCall().catch((err) => {
        console.error('Erro ao iniciar chamada:', err);
        toast.error('Erro ao iniciar videochamada. Verifique as permissões de câmera e microfone.');
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mostrar erros
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleEndCall = () => {
    endCall();
    if (onEndCall) {
      onEndCall();
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Video className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-white font-semibold">
              Videochamada - {patientName || 'Paciente'}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {isConnected ? (
                <Badge variant="outline" className="text-xs bg-green-900/20 border-green-700 text-green-400">
                  Conectado
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs bg-yellow-900/20 border-yellow-700 text-yellow-400">
                  Conectando...
                </Badge>
              )}
              {callDuration && (
                <span className="text-xs text-slate-400">{callDuration}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-black overflow-hidden">
        {/* Vídeo Remoto (Principal) */}
        <div className="absolute inset-0">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-950">
              <div className="text-center text-slate-400">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Aguardando participante...</p>
              </div>
            </div>
          )}
        </div>

        {/* Vídeo Local (PIP) */}
        {localStream && (
          <div className="absolute bottom-4 right-4 w-64 h-48 bg-slate-900 rounded-lg overflow-hidden border-2 border-slate-700 shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!isCameraEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                <VideoOff className="h-8 w-8 text-slate-500" />
              </div>
            )}
          </div>
        )}

        {/* Overlay de Status */}
        {!isConnected && isCallActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm">Conectando...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-center gap-3">
        <Button
          variant={isMicEnabled ? 'secondary' : 'destructive'}
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={toggleMic}
          title={isMicEnabled ? 'Desativar microfone' : 'Ativar microfone'}
        >
          {isMicEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>

        <Button
          variant={isCameraEnabled ? 'secondary' : 'destructive'}
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={toggleCamera}
          title={isCameraEnabled ? 'Desativar câmera' : 'Ativar câmera'}
        >
          {isCameraEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>

        <Button
          variant={isScreenSharing ? 'default' : 'secondary'}
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={toggleScreenShare}
          title={isScreenSharing ? 'Parar compartilhamento' : 'Compartilhar tela'}
        >
          <MonitorUp className="h-5 w-5" />
        </Button>

        <Button
          variant="destructive"
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={handleEndCall}
          title="Encerrar chamada"
        >
          <PhoneOff className="h-5 w-5" />
        </Button>
      </div>

      {/* Info */}
      <div className="px-6 py-2 bg-slate-950 border-t border-slate-800">
        <p className="text-xs text-slate-400 text-center">
          💡 Esta é uma videochamada WebRTC P2P. Para múltiplos participantes, configure um servidor de sinalização.
        </p>
      </div>
    </div>
  );
};


import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, PhoneOff, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface ZoomVideoCallProps {
  meetingNumber: string;
  meetingPassword?: string;
  patientName?: string;
  onEndCall?: () => void;
  callDuration?: string;
  userName?: string;
  userEmail?: string;
}

export const ZoomVideoCall = ({ 
  meetingNumber, 
  meetingPassword,
  patientName, 
  onEndCall, 
  callDuration,
  userName = 'Dr. João Santos',
  userEmail = 'joao.santos@CactoSaude.com'
}: ZoomVideoCallProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Verificar se é um número de reunião Zoom válido (9-12 dígitos numéricos)
  const isRealMeetingNumber = meetingNumber && /^\d{9,12}$/.test(meetingNumber);
  
  // Construir URL do Zoom Web Client
  const zoomUrl = isRealMeetingNumber && meetingPassword
    ? `https://zoom.us/wc/${meetingNumber}/join?pwd=${meetingPassword}&uname=${encodeURIComponent(userName)}&email=${encodeURIComponent(userEmail)}`
    : isRealMeetingNumber
    ? `https://zoom.us/wc/${meetingNumber}/join?uname=${encodeURIComponent(userName)}&email=${encodeURIComponent(userEmail)}`
    : `https://zoom.us/meeting#/create`; // Criar reunião instantânea

  useEffect(() => {
    if (isRealMeetingNumber) {
      // Se tiver número real, carregar iframe
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
    // Se não tiver número real, não fazer nada (usuário precisa inserir manualmente)
  }, [isRealMeetingNumber]);

  const handleOpenInNewTab = () => {
    window.open(zoomUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="h-full flex flex-col bg-slate-900" style={{ minHeight: '400px' }}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Video className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-white font-semibold">
              Videochamada Zoom - {patientName || 'Paciente'}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs bg-blue-900/20 border-blue-700 text-blue-400">
                Zoom Meeting
              </Badge>
              {callDuration && (
                <span className="text-xs text-slate-400">{callDuration}</span>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenInNewTab}
          className="border-blue-500/50 text-blue-200 hover:bg-blue-600/30"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Abrir em Nova Aba
        </Button>
      </div>

      {/* Zoom Web Client */}
      <div className="flex-1 relative bg-black overflow-hidden">
        {!isRealMeetingNumber ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
            <div className="text-center text-white space-y-4 max-w-md px-6">
              <Video className="h-16 w-16 mx-auto text-blue-400" />
              <h3 className="text-xl font-semibold">Insira o Número da Reunião Zoom</h3>
              <p className="text-sm text-slate-300">
                Para usar Zoom, você precisa inserir o número de uma reunião Zoom existente.
              </p>
              <div className="text-left text-sm text-slate-400 space-y-2 bg-slate-800/50 p-4 rounded-lg">
                <p><strong>Opção 1:</strong> Criar reunião no Zoom Web Client e copiar o número</p>
                <p><strong>Opção 2:</strong> Usar uma reunião Zoom já existente</p>
                <p><strong>Opção 3:</strong> Configurar API do Zoom para criar reuniões automaticamente</p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="default"
                  onClick={() => {
                    window.open('https://zoom.us/meeting#/create', '_blank', 'noopener,noreferrer');
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Criar Reunião no Zoom
                </Button>
                <Button
                  variant="outline"
                  onClick={onEndCall}
                >
                  Fechar
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-4">
                💡 Use WebRTC (recomendado) ou Jitsi para videochamadas sem configuração adicional
              </p>
            </div>
          </div>
        ) : (
          <>
            {!isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950 z-10">
                <div className="text-center text-white space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm">Carregando Zoom...</p>
                  <p className="text-xs text-slate-400">Aguarde enquanto conectamos à reunião</p>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={zoomUrl}
              allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
              className="w-full h-full border-0"
              style={{ minHeight: '600px' }}
              onLoad={() => setIsLoaded(true)}
            />
          </>
        )}
      </div>

      {/* Info Footer */}
      <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-xs text-slate-400">
            ID da Reunião: <span className="font-mono text-slate-300">{meetingNumber}</span>
          </p>
          {meetingPassword && (
            <>
              <span className="text-slate-600">•</span>
              <p className="text-xs text-slate-400">
                Senha: <span className="font-mono text-slate-300">{meetingPassword}</span>
              </p>
            </>
          )}
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={onEndCall}
        >
          <PhoneOff className="h-4 w-4 mr-2" />
          Encerrar Chamada
        </Button>
      </div>

      {/* Info Message */}
      <div className="px-6 py-2 bg-blue-900/20 border-t border-blue-500/30">
        <p className="text-xs text-blue-200 text-center">
          💡 Se o Zoom não carregar automaticamente, clique em "Abrir em Nova Aba" ou permita pop-ups no navegador.
        </p>
      </div>
    </div>
  );
};


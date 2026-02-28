import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WebRTCVideoCall } from '@/components/WebRTCVideoCall';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, ArrowLeft } from 'lucide-react';

const VideoCallJoin = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [callStarted, setCallStarted] = useState(false);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [callDuration, setCallDuration] = useState("00:00:00");
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (roomId) {
      // Iniciar chamada automaticamente após um pequeno delay
      setTimeout(() => {
        setCallStarted(true);
        setCallStartTime(new Date());
      }, 500);
    }
  }, [roomId]);

  // Timer para duração da chamada
  useEffect(() => {
    if (callStartTime && callStarted) {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - callStartTime.getTime();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setCallDuration(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [callStartTime, callStarted]);

  if (!roomId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Link Inválido</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              O link da videochamada é inválido ou expirou.
            </p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!callStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              Preparando Videochamada
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Aguarde enquanto preparamos sua videochamada...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <WebRTCVideoCall
        roomId={roomId}
        patientName="Participante"
        onEndCall={() => navigate('/')}
        callDuration={callDuration}
      />
    </div>
  );
};

export default VideoCallJoin;


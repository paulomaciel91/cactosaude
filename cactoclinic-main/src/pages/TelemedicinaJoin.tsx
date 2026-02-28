import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Telemedicina } from '@/components/Telemedicina';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const TelemedicinaJoin = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [callStarted, setCallStarted] = useState(false);
  const [patientName, setPatientName] = useState("Participante");

  useEffect(() => {
    if (roomId) {
      // Tentar obter nome do paciente da URL ou localStorage
      const urlParams = new URLSearchParams(window.location.search);
      const name = urlParams.get('name') || localStorage.getItem('patientName') || "Participante";
      setPatientName(name);
      
      // Iniciar chamada automaticamente após um pequeno delay
      setTimeout(() => {
        setCallStarted(true);
        toast.success("Conectando à sala de telemedicina...");
      }, 500);
    } else {
      toast.error("Link inválido");
    }
  }, [roomId]);

  if (!roomId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d]">
        <Card className="w-full max-w-md bg-[#1a1a1a] border-[#404040]">
          <CardHeader>
            <CardTitle className="text-center text-white">Link Inválido</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              O link da telemedicina é inválido ou expirou.
            </p>
            <Button onClick={() => window.close()} className="bg-primary hover:bg-primary/90">
              Fechar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!callStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d]">
        <Card className="w-full max-w-md bg-[#1a1a1a] border-[#404040]">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2 text-white">
              <Video className="h-5 w-5 text-primary" />
              Preparando Telemedicina
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Aguarde enquanto preparamos sua consulta de telemedicina...
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Certifique-se de permitir o acesso à câmera e microfone quando solicitado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] flex items-center justify-center p-4">
      <div className="w-full max-w-7xl h-[92vh]">
        <Telemedicina
          patientName={patientName}
          doctorName="Dr. João Santos"
          roomId={roomId}
          isDoctor={false}
          onClose={() => {
            // Ao fechar, mostrar mensagem e redirecionar para página simples
            toast.info("Consulta encerrada. Obrigado!");
            setTimeout(() => {
              navigate('/consulta-finalizada');
            }, 1000);
          }}
        />
      </div>
    </div>
  );
};

export default TelemedicinaJoin;


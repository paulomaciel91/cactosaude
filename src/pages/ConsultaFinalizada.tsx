import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const ConsultaFinalizada = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] p-4">
      <Card className="w-full max-w-md bg-[#1a1a1a] border-[#404040]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <CardTitle className="text-white">Consulta Finalizada</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Sua consulta de telemedicina foi encerrada com sucesso.
          </p>
          <p className="text-sm text-muted-foreground">
            Obrigado por utilizar nossos serviços!
          </p>
          <Button 
            onClick={() => window.close()} 
            className="w-full bg-primary hover:bg-primary/90"
          >
            Fechar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsultaFinalizada;


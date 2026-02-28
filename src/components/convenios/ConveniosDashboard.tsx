import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { tissService } from '@/lib/tissService';
import {
  DollarSign,
  Package,
  Send,
  CheckCircle,
  AlertTriangle,
  FileText,
  TrendingUp,
  Clock,
  Plus,
  Download,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

export const ConveniosDashboard = () => {
  const [estatisticas, setEstatisticas] = useState(tissService.getEstatisticas());
  const [guiasPendentes, setGuiasPendentes] = useState<any[]>([]);
  const [lotesAguardando, setLotesAguardando] = useState<any[]>([]);
  const [glosasPendentes, setGlosasPendentes] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    
    const handleUpdate = () => {
      loadData();
    };
    
    window.addEventListener('guiaCreated', handleUpdate);
    window.addEventListener('guiaUpdated', handleUpdate);
    window.addEventListener('loteCreated', handleUpdate);
    
    return () => {
      window.removeEventListener('guiaCreated', handleUpdate);
      window.removeEventListener('guiaUpdated', handleUpdate);
      window.removeEventListener('loteCreated', handleUpdate);
    };
  }, []);

  const loadData = () => {
    const stats = tissService.getEstatisticas();
    setEstatisticas(stats);
    
    const guias = tissService.getAllGuias();
    setGuiasPendentes(
      guias.filter(g => g.status === 'FINALIZADA' || g.status === 'RASCUNHO').slice(0, 5)
    );
    
    const lotes = tissService.getAllLotes();
    setLotesAguardando(
      lotes.filter(l => l.status === 'FECHADO' || l.status === 'ABERTO').slice(0, 5)
    );
    
    const glosas = tissService.getAllGlosas();
    setGlosasPendentes(
      glosas.filter(g => g.status === 'PENDENTE' || g.status === 'EM_CONTESTACAO').slice(0, 5)
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor a Faturar</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(estatisticas.valorAFaturar)}</div>
            <p className="text-xs text-muted-foreground">Guias finalizadas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lotes Abertos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.lotesAbertos}</div>
            <p className="text-xs text-muted-foreground">Aguardando fechamento</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lotes Enviados</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.lotesEnviados}</div>
            <p className="text-xs text-muted-foreground">Aguardando retorno</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guias Pagas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.guiasPagas}</div>
            <p className="text-xs text-muted-foreground">Total processadas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Glosado</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(estatisticas.valorGlosado)}</div>
            <p className="text-xs text-muted-foreground">Pendente de contestação</p>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('dashboard-nova-guia'));
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Guia TISS
            </Button>
            <Button 
              variant="outline" 
              className="bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary border-primary/20"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('dashboard-criar-lote'));
              }}
            >
              <Package className="h-4 w-4 mr-2" />
              Criar Lote
            </Button>
            <Button 
              variant="outline" 
              className="bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary border-primary/20"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('dashboard-importar-retorno'));
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Importar Retorno
            </Button>
            <Button 
              variant="outline" 
              className="bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary border-primary/20"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('dashboard-ver-glosas'));
              }}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Ver Glosas
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alertas */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Guias Pendentes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Guias Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {guiasPendentes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma guia pendente</p>
            ) : (
              <div className="space-y-2">
                {guiasPendentes.map((guia) => (
                  <div key={guia.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="text-sm font-medium">{guia.numeroGuia}</p>
                      <p className="text-xs text-muted-foreground">{guia.convenioNome}</p>
                    </div>
                    <Badge variant={guia.status === 'FINALIZADA' ? 'default' : 'secondary'}>
                      {guia.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lotes Aguardando Retorno */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Lotes Aguardando Retorno
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lotesAguardando.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum lote aguardando</p>
            ) : (
              <div className="space-y-2">
                {lotesAguardando.map((lote) => (
                  <div key={lote.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="text-sm font-medium">{lote.numeroLote}</p>
                      <p className="text-xs text-muted-foreground">{lote.convenioNome}</p>
                    </div>
                    <Badge variant="outline">{lote.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Glosas para Contestar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Glosas para Contestar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {glosasPendentes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma glosa pendente</p>
            ) : (
              <div className="space-y-2">
                {glosasPendentes.map((glosa) => (
                  <Alert key={glosa.id} variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{glosa.numeroGuia}</p>
                          <p className="text-xs">{formatCurrency(glosa.valorGlosado)}</p>
                        </div>
                        <Badge variant="destructive">{glosa.diasRestantes}d</Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timeline de Atividades Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Atividades Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded">
              <div className="h-2 w-2 rounded-full bg-primary mt-2" />
              <div className="flex-1">
                <p className="text-sm font-medium">Nova guia criada</p>
                <p className="text-xs text-muted-foreground">Guia #123456 - Unimed</p>
                <p className="text-xs text-muted-foreground">há 2 horas</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded">
              <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
              <div className="flex-1">
                <p className="text-sm font-medium">Lote enviado</p>
                <p className="text-xs text-muted-foreground">LOTE202401ABC - Amil</p>
                <p className="text-xs text-muted-foreground">há 5 horas</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded">
              <div className="h-2 w-2 rounded-full bg-red-500 mt-2" />
              <div className="flex-1">
                <p className="text-sm font-medium">Glosa identificada</p>
                <p className="text-xs text-muted-foreground">Guia #123450 - SulAmérica</p>
                <p className="text-xs text-muted-foreground">há 1 dia</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


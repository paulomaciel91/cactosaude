import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { canViewModule } from '@/lib/permissionService';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, FileText, Package, Send, Download, AlertTriangle, Settings } from 'lucide-react';
import { ConveniosDashboard } from '@/components/convenios/ConveniosDashboard';
import { GuiasTISS } from '@/components/convenios/GuiasTISS';
import { LotesFaturamento } from '@/components/convenios/LotesFaturamento';
import { EnvioXML } from '@/components/convenios/EnvioXML';
import { RetornosTISS } from '@/components/convenios/RetornosTISS';
import { GlosasTISS } from '@/components/convenios/GlosasTISS';
import { ConfiguracoesTISS } from '@/components/convenios/ConfiguracoesTISS';

export default function Convenios() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const location = useLocation();
  const navigate = useNavigate();

  // Verificar permissão ao montar o componente
  useEffect(() => {
    if (!canViewModule("Convênios")) {
      toast.error("Você não tem permissão para acessar este módulo.");
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    // Verificar se há dados para gerar guia vindo da Consulta
    const state = location.state as { generateGuia?: boolean; patientData?: any } | null;
    if (state?.generateGuia && state?.patientData) {
      setActiveTab('guias');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('openNewGuiaDialog', { detail: state.patientData }));
      }, 200);
      // Limpar o state para evitar reabrir ao navegar novamente
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const handleNovaGuia = () => {
      setActiveTab('guias');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('openNewGuiaDialog'));
      }, 100);
    };

    const handleCriarLote = () => {
      setActiveTab('lotes');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('openNewLoteDialog'));
      }, 100);
    };

    const handleImportarRetorno = () => {
      setActiveTab('retornos');
    };

    const handleVerGlosas = () => {
      setActiveTab('glosas');
    };

    window.addEventListener('dashboard-nova-guia', handleNovaGuia);
    window.addEventListener('dashboard-criar-lote', handleCriarLote);
    window.addEventListener('dashboard-importar-retorno', handleImportarRetorno);
    window.addEventListener('dashboard-ver-glosas', handleVerGlosas);

    return () => {
      window.removeEventListener('dashboard-nova-guia', handleNovaGuia);
      window.removeEventListener('dashboard-criar-lote', handleCriarLote);
      window.removeEventListener('dashboard-importar-retorno', handleImportarRetorno);
      window.removeEventListener('dashboard-ver-glosas', handleVerGlosas);
    };
  }, []);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            Convênios TISS
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestão completa de faturamento TISS, guias, lotes, retornos e glosas
          </p>
        </div>
      </div>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard">
            <Building2 className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="guias">
            <FileText className="h-4 w-4 mr-2" />
            Guias TISS
          </TabsTrigger>
          <TabsTrigger value="lotes">
            <Package className="h-4 w-4 mr-2" />
            Lotes
          </TabsTrigger>
          <TabsTrigger value="enviar">
            <Send className="h-4 w-4 mr-2" />
            Enviar
          </TabsTrigger>
          <TabsTrigger value="retornos">
            <Download className="h-4 w-4 mr-2" />
            Retornos
          </TabsTrigger>
          <TabsTrigger value="glosas">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Glosa
          </TabsTrigger>
          <TabsTrigger value="configuracoes">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard" className="space-y-4 mt-4">
          <ConveniosDashboard />
        </TabsContent>

        {/* Guias TISS */}
        <TabsContent value="guias" className="space-y-4 mt-4">
          <GuiasTISS />
        </TabsContent>

        {/* Lotes */}
        <TabsContent value="lotes" className="space-y-4 mt-4">
          <LotesFaturamento />
        </TabsContent>

        {/* Envio XML */}
        <TabsContent value="enviar" className="space-y-4 mt-4">
          <EnvioXML />
        </TabsContent>

        {/* Retornos */}
        <TabsContent value="retornos" className="space-y-4 mt-4">
          <RetornosTISS />
        </TabsContent>

        {/* Glosas */}
        <TabsContent value="glosas" className="space-y-4 mt-4">
          <GlosasTISS />
        </TabsContent>

        {/* Configurações */}
        <TabsContent value="configuracoes" className="space-y-4 mt-4">
          <ConfiguracoesTISS />
        </TabsContent>
      </Tabs>
    </div>
  );
}


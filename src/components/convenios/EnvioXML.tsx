import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Send, Download, FileCode, CheckCircle, Eye, AlertCircle } from 'lucide-react';
import { tissService } from '@/lib/tissService';
import { xmlTISSGenerator } from '@/lib/xmlTISSGenerator';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export const EnvioXML = () => {
  const [selectedLote, setSelectedLote] = useState<string>('');
  const [xmlPreview, setXmlPreview] = useState<string>('');
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; errors: string[] } | null>(null);
  const lotes = tissService.getAllLotes().filter(l => l.status === 'FECHADO');

  const handleGerarXML = () => {
    if (!selectedLote) {
      toast.error("Selecione um lote");
      return;
    }

    const lote = tissService.getLoteById(selectedLote);
    if (!lote) {
      toast.error("Lote não encontrado");
      return;
    }

    const guias = tissService.getAllGuias().filter(g => lote.guias.includes(g.id));
    if (guias.length === 0) {
      toast.error("Lote não possui guias");
      return;
    }

    const config = tissService.getConfig();
    const xml = xmlTISSGenerator.generateLoteXML(lote, guias, config);
    
    // Validar XML
    const validation = xmlTISSGenerator.validateXML(xml);
    setValidationResult(validation);

    if (!validation.valid) {
      toast.error("XML possui erros de validação");
      return;
    }

    // Salvar XML no lote
    tissService.updateLote(lote.id, { xmlGerado: xml });
    
    // Atualizar status das guias para ENVIADA
    guias.forEach(guia => {
      tissService.updateGuia(guia.id, {
        status: 'ENVIADA',
        dataEnvio: new Date().toISOString(),
        protocoloEnvio: `PROT-${Date.now()}`
      });
    });

    setXmlPreview(xml);
    toast.success("XML gerado com sucesso!");
  };

  const handleDownloadXML = () => {
    if (!xmlPreview) {
      toast.error("Gere o XML primeiro");
      return;
    }

    const lote = tissService.getLoteById(selectedLote);
    if (!lote) return;

    const blob = new Blob([xmlPreview], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lote_${lote.numeroLote}_${new Date().toISOString().split('T')[0]}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("XML baixado com sucesso!");
  };

  const handleEnviarXML = () => {
    if (!selectedLote || !xmlPreview) {
      toast.error("Gere o XML primeiro");
      return;
    }

    const lote = tissService.getLoteById(selectedLote);
    if (!lote) return;

    // Atualizar status do lote
    tissService.updateLote(lote.id, {
      status: 'ENVIADO',
      dataEnvio: new Date().toISOString(),
      protocoloEnvio: `PROT-${Date.now()}`
    });

    toast.success("XML enviado com sucesso!");
    
    // Em produção, aqui faria o envio real via API/webhook
    const config = tissService.getConfig();
    if (config?.integracaoN8N?.url) {
      // Enviar para n8n webhook
      fetch(config.integracaoN8N.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'Authorization': `Bearer ${config.integracaoN8N.token}`
        },
        body: xmlPreview
      }).catch(err => {
        console.error('Erro ao enviar para n8n:', err);
        toast.error("Erro ao enviar para webhook n8n");
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileCode className="h-5 w-5 text-primary" />
            Geração e Envio de XML TISS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Selecione o Lote</label>
            <Select value={selectedLote} onValueChange={setSelectedLote}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um lote fechado" />
              </SelectTrigger>
              <SelectContent>
                {lotes.map((lote) => (
                  <SelectItem key={lote.id} value={lote.id}>
                    {lote.numeroLote} - {lote.convenioNome} ({lote.competencia})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleGerarXML} className="bg-primary hover:bg-primary/90" disabled={!selectedLote}>
              <FileCode className="h-4 w-4 mr-2" />
              Gerar XML
            </Button>
            {xmlPreview && (
              <>
                <Button
                  onClick={() => setPreviewDialogOpen(true)}
                  variant="outline"
                  className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar
                </Button>
                <Button
                  onClick={handleDownloadXML}
                  variant="outline"
                  className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar XML
                </Button>
                <Button
                  onClick={handleEnviarXML}
                  variant="outline"
                  className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar XML
                </Button>
              </>
            )}
          </div>

          {validationResult && (
            <Alert variant={validationResult.valid ? 'default' : 'destructive'}>
              {validationResult.valid ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {validationResult.valid ? (
                  'XML válido e pronto para envio'
                ) : (
                  <div>
                    <p className="font-semibold">Erros encontrados:</p>
                    <ul className="list-disc ml-4 mt-1">
                      {validationResult.errors.map((err, idx) => (
                        <li key={idx} className="text-sm">{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Validações:</strong> O sistema validará automaticamente o XML contra o schema XSD antes do envio.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico de Envios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-8">
            Nenhum envio registrado ainda
          </div>
        </CardContent>
      </Card>

      {/* Dialog Preview XML */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview do XML TISS</DialogTitle>
            <DialogDescription>
              Visualização do XML gerado para o lote
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={xmlPreview}
              readOnly
              className="font-mono text-xs h-[500px]"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};


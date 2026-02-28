import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { tissService, RetornoXML } from '@/lib/tissService';
import { xmlTISSParser } from '@/lib/xmlTISSParser';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export const RetornosTISS = () => {
  const [file, setFile] = useState<File | null>(null);
  const [retornos, setRetornos] = useState<RetornoXML[]>([]);
  const [selectedRetorno, setSelectedRetorno] = useState<RetornoXML | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadRetornos();
  }, []);

  const loadRetornos = () => {
    const allRetornos = tissService.getAllRetornos();
    setRetornos(allRetornos.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xml')) {
        setFile(selectedFile);
        toast.success("Arquivo selecionado com sucesso!");
      } else {
        toast.error("Por favor, selecione um arquivo XML");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Selecione um arquivo XML");
      return;
    }

    setProcessing(true);

    try {
      const fileContent = await file.text();
      
      // Tentar identificar o lote (pode ser melhorado com busca no XML)
      const lotes = tissService.getAllLotes().filter(l => l.status === 'ENVIADO');
      const loteMaisRecente = lotes.sort((a, b) => 
        new Date(b.dataEnvio || '').getTime() - new Date(a.dataEnvio || '').getTime()
      )[0];

      if (!loteMaisRecente) {
        toast.error("Nenhum lote enviado encontrado");
        setProcessing(false);
        return;
      }

      // Parsear XML
      const parsedRetorno = xmlTISSParser.parseRetornoXML(fileContent, loteMaisRecente.id);
      
      if (!parsedRetorno) {
        toast.error("Erro ao processar XML. Verifique se o arquivo está correto.");
        setProcessing(false);
        return;
      }

      // Obter guias do lote
      const guias = tissService.getAllGuias().filter(g => 
        loteMaisRecente.guias.includes(g.id)
      );

      // Processar retorno
      const resultado = xmlTISSParser.processarRetorno(parsedRetorno, guias);

      // Criar registro de retorno
      const retorno = tissService.createRetorno({
        loteId: loteMaisRecente.id,
        protocolo: parsedRetorno.protocolo,
        arquivoXml: fileContent,
        dataProcessamento: new Date().toISOString(),
        valorTotal: parsedRetorno.valorTotal,
        valorPago: parsedRetorno.valorPago,
        valorGlosado: parsedRetorno.valorGlosado,
        guiasProcessadas: parsedRetorno.guiasProcessadas.length,
        glosasIdentificadas: resultado.glosasCriadas,
        status: 'PROCESSADO'
      });

      // Atualizar lote
      tissService.updateLote(loteMaisRecente.id, {
        status: 'PROCESSADO',
        retornoProcessado: true
      });

      toast.success(
        `Retorno processado! ${resultado.guiasAtualizadas} guias atualizadas, ${resultado.glosasCriadas} glosas criadas.`
      );
      
      setFile(null);
      loadRetornos();
    } catch (error) {
      console.error('Erro ao processar retorno:', error);
      toast.error("Erro ao processar retorno. Verifique o arquivo XML.");
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Importação de Retornos XML
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm font-medium mb-2">Arraste o arquivo XML aqui</p>
            <p className="text-xs text-muted-foreground mb-4">ou</p>
            <label htmlFor="file-upload">
              <Button variant="outline" asChild>
                <span>Selecionar Arquivo</span>
              </Button>
              <input
                id="file-upload"
                type="file"
                accept=".xml"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
            {file && (
              <div className="mt-4 p-3 bg-muted rounded">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}
          </div>

          <Button
            onClick={handleUpload}
            disabled={!file || processing}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {processing ? (
              <>
                <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Processar Retorno
              </>
            )}
          </Button>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>O que acontece ao processar:</strong>
            </p>
            <ul className="text-xs text-blue-800 mt-2 space-y-1 list-disc list-inside">
              <li>Validação do arquivo XML</li>
              <li>Identificação do lote correspondente</li>
              <li>Atualização do status das guias</li>
              <li>Identificação de valores pagos e glosas</li>
              <li>Conciliação automática com Financeiro</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Retornos Processados</CardTitle>
        </CardHeader>
        <CardContent>
          {retornos.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              Nenhum retorno processado ainda
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Protocolo</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Guias</TableHead>
                  <TableHead>Valor Pago</TableHead>
                  <TableHead>Valor Glosado</TableHead>
                  <TableHead>Glosas</TableHead>
                  <TableHead className="w-[80px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {retornos.map((retorno) => (
                  <TableRow key={retorno.id}>
                    <TableCell className="font-mono text-xs">{retorno.protocolo}</TableCell>
                    <TableCell>{retorno.loteId}</TableCell>
                    <TableCell>
                      {new Date(retorno.dataProcessamento).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>{retorno.guiasProcessadas}</TableCell>
                    <TableCell>{formatCurrency(retorno.valorPago)}</TableCell>
                    <TableCell>{formatCurrency(retorno.valorGlosado)}</TableCell>
                    <TableCell>
                      <Badge variant={retorno.glosasIdentificadas > 0 ? 'destructive' : 'default'}>
                        {retorno.glosasIdentificadas}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedRetorno(retorno);
                          setViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 text-blue-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog Visualizar Retorno */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Retorno</DialogTitle>
            <DialogDescription>
              Protocolo: {selectedRetorno?.protocolo}
            </DialogDescription>
          </DialogHeader>
          {selectedRetorno && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Valor Total</p>
                  <p className="font-semibold">{formatCurrency(selectedRetorno.valorTotal)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Valor Pago</p>
                  <p className="font-semibold text-green-600">{formatCurrency(selectedRetorno.valorPago)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Valor Glosado</p>
                  <p className="font-semibold text-red-600">{formatCurrency(selectedRetorno.valorGlosado)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Guias Processadas</p>
                  <p className="font-semibold">{selectedRetorno.guiasProcessadas}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Glosas Identificadas</p>
                  <p className="font-semibold">{selectedRetorno.glosasIdentificadas}</p>
                </div>
              </div>
              {selectedRetorno.erros && selectedRetorno.erros.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm font-semibold text-red-900 mb-2">Erros:</p>
                  <ul className="list-disc ml-4 space-y-1">
                    {selectedRetorno.erros.map((erro, idx) => (
                      <li key={idx} className="text-xs text-red-800">{erro}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};


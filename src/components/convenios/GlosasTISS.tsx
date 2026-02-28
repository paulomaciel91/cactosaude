import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, Clock, FileText, Send, CheckCircle, Upload, X, Eye } from 'lucide-react';
import { tissService, Glosa, GuiaTISS } from '@/lib/tissService';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export const GlosasTISS = () => {
  const [glosas, setGlosas] = useState<Glosa[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [contestacaoDialogOpen, setContestacaoDialogOpen] = useState(false);
  const [selectedGlosa, setSelectedGlosa] = useState<Glosa | null>(null);
  const [guiaDetalhes, setGuiaDetalhes] = useState<GuiaTISS | null>(null);
  const [contestacaoData, setContestacaoData] = useState({
    justificativa: '',
    documentos: [] as string[]
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  useEffect(() => {
    loadGlosas();
    
    const handleUpdate = () => {
      loadGlosas();
    };
    
    window.addEventListener('guiaUpdated', handleUpdate);
    
    return () => {
      window.removeEventListener('guiaUpdated', handleUpdate);
    };
  }, []);

  const loadGlosas = () => {
    const allGlosas = tissService.getAllGlosas();
    // Calcular dias restantes
    const updated = allGlosas.map(glosa => {
      const prazoDate = new Date(glosa.prazoContestacao);
      const hoje = new Date();
      const diasRestantes = Math.ceil((prazoDate.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      return { ...glosa, diasRestantes };
    });
    setGlosas(updated);
  };

  const handleContestarGlosa = (glosa: Glosa) => {
    setSelectedGlosa(glosa);
    const guia = tissService.getGuiaById(glosa.guiaId);
    setGuiaDetalhes(guia || null);
    setContestacaoData({ justificativa: '', documentos: [] });
    setUploadedFiles([]);
    setContestacaoDialogOpen(true);
  };

  const handleViewGlosa = (glosa: Glosa) => {
    toast.info("Visualização detalhada em desenvolvimento");
  };

  const handleSalvarContestacao = () => {
    if (!selectedGlosa || !contestacaoData.justificativa.trim()) {
      toast.error("Preencha a justificativa");
      return;
    }

    const protocolo = `CONTEST-${Date.now()}`;
    
    tissService.updateGlosa(selectedGlosa.id, {
      status: 'EM_CONTESTACAO',
      dataContestacao: new Date().toISOString(),
      protocoloContestacao: protocolo,
      justificativaContestacao: contestacaoData.justificativa,
      documentosContestacao: contestacaoData.documentos
    });

    toast.success("Contestação enviada com sucesso! Protocolo: " + protocolo);
    setContestacaoDialogOpen(false);
    setContestacaoData({ justificativa: '', documentos: [] });
    setUploadedFiles([]);
    loadGlosas();
  };

  const filteredGlosas = filterStatus === 'all' 
    ? glosas 
    : glosas.filter(g => g.status === filterStatus);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      PENDENTE: { variant: 'destructive', label: 'Pendente' },
      EM_CONTESTACAO: { variant: 'default', label: 'Em Contestação' },
      REVERTIDA: { variant: 'default', label: 'Revertida', className: 'bg-green-500' },
      ACEITA: { variant: 'secondary', label: 'Aceita' }
    };
    const config = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const valorTotalGlosado = glosas
    .filter(g => g.status === 'PENDENTE' || g.status === 'EM_CONTESTACAO')
    .reduce((sum, g) => sum + g.valorGlosado, 0);

  return (
    <div className="space-y-4">
      {/* Métricas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Glosado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(valorTotalGlosado)}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Glosas Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {glosas.filter(g => g.status === 'PENDENTE').length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Em Contestação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {glosas.filter(g => g.status === 'EM_CONTESTACAO').length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revertidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {glosas.filter(g => g.status === 'REVERTIDA').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Tabela */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Gestão de Glosas
            </CardTitle>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="PENDENTE">Pendentes</SelectItem>
                <SelectItem value="EM_CONTESTACAO">Em Contestação</SelectItem>
                <SelectItem value="REVERTIDA">Revertidas</SelectItem>
                <SelectItem value="ACEITA">Aceitas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guia</TableHead>
                <TableHead>Convênio</TableHead>
                <TableHead>Código Glosa</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[140px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGlosas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhuma glosa encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredGlosas.map((glosa) => (
                  <TableRow key={glosa.id}>
                    <TableCell className="font-medium">{glosa.numeroGuia}</TableCell>
                    <TableCell>{glosa.convenioNome}</TableCell>
                    <TableCell>{glosa.codigoGlosa}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{glosa.motivoGlosa}</TableCell>
                    <TableCell>{formatCurrency(glosa.valorGlosado)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{glosa.diasRestantes}d</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(glosa.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {glosa.status === 'PENDENTE' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleContestarGlosa(glosa)}
                          >
                            <Send className="h-4 w-4 text-primary" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewGlosa(glosa)}
                        >
                          <Eye className="h-4 w-4 text-blue-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Contestar Glosa */}
      <Dialog open={contestacaoDialogOpen} onOpenChange={setContestacaoDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Contestar Glosa
            </DialogTitle>
            <DialogDescription>
              Guia: {selectedGlosa?.numeroGuia} - Valor glosado: {selectedGlosa && formatCurrency(selectedGlosa.valorGlosado)}
            </DialogDescription>
          </DialogHeader>
          {selectedGlosa && guiaDetalhes && (
            <div className="space-y-4">
              {/* Informações da Glosa */}
              <Card>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Código da Glosa</p>
                      <p className="font-semibold">{selectedGlosa.codigoGlosa}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Motivo</p>
                      <p className="font-semibold">{selectedGlosa.motivoGlosa}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Valor Glosado</p>
                      <p className="font-semibold text-red-600">{formatCurrency(selectedGlosa.valorGlosado)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Prazo para Contestação</p>
                      <p className="font-semibold">
                        {new Date(selectedGlosa.prazoContestacao).toLocaleDateString('pt-BR')} 
                        ({selectedGlosa.diasRestantes} dias restantes)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Informações da Guia */}
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-3">Informações da Guia</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Paciente</p>
                      <p className="font-medium">{guiaDetalhes.pacienteNome}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">CPF</p>
                      <p className="font-medium">{guiaDetalhes.pacienteCpf}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">CID-10</p>
                      <p className="font-medium">{guiaDetalhes.cid10} - {guiaDetalhes.cid10Descricao}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Profissional</p>
                      <p className="font-medium">{guiaDetalhes.profissionalNome} - CRM {guiaDetalhes.profissionalCrm}/{guiaDetalhes.profissionalCrmEstado}</p>
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div>
                    <p className="text-sm font-semibold mb-2">Procedimentos</p>
                    <div className="space-y-1">
                      {guiaDetalhes.procedimentos.map((proc, idx) => (
                        <div key={idx} className="text-xs p-2 bg-muted rounded">
                          {proc.codigoTUSS} - {proc.descricao} - {formatCurrency(proc.valorTotal)}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Formulário de Contestação */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Justificativa Técnica *</Label>
                  <Textarea
                    placeholder="Descreva a justificativa técnica para contestação da glosa..."
                    value={contestacaoData.justificativa}
                    onChange={(e) => setContestacaoData({ ...contestacaoData, justificativa: e.target.value })}
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Explique detalhadamente o motivo da contestação, incluindo aspectos clínicos e técnicos.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Documentos Comprobatórios</Label>
                  <div className="border-2 border-dashed border-muted rounded-lg p-4">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Arraste arquivos aqui ou clique para selecionar</p>
                      <label htmlFor="document-upload">
                        <Button variant="outline" size="sm" asChild>
                          <span>Selecionar Arquivos</span>
                        </Button>
                        <input
                          id="document-upload"
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setUploadedFiles([...uploadedFiles, ...files]);
                            const fileNames = files.map(f => f.name);
                            setContestacaoData({
                              ...contestacaoData,
                              documentos: [...contestacaoData.documentos, ...fileNames]
                            });
                          }}
                        />
                      </label>
                    </div>
                    {uploadedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {uploadedFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({(file.size / 1024).toFixed(2)} KB)
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const novos = uploadedFiles.filter((_, i) => i !== idx);
                                setUploadedFiles(novos);
                                setContestacaoData({
                                  ...contestacaoData,
                                  documentos: novos.map(f => f.name)
                                });
                              }}
                            >
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Anexe documentos que comprovem a necessidade do procedimento (exames, laudos, etc.)
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setContestacaoDialogOpen(false);
              setContestacaoData({ justificativa: '', documentos: [] });
              setUploadedFiles([]);
            }}>
              Cancelar
            </Button>
            <Button
              onClick={handleSalvarContestacao}
              disabled={!contestacaoData.justificativa.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar Contestação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


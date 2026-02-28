import { useState, useEffect, useCallback } from 'react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Eye, FileText, Package, X, CheckCircle, Lock } from 'lucide-react';
import { tissService, LoteFaturamento, GuiaTISS } from '@/lib/tissService';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export const LotesFaturamento = () => {
  const [lotes, setLotes] = useState<LoteFaturamento[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLote, setSelectedLote] = useState<LoteFaturamento | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [addGuiasDialogOpen, setAddGuiasDialogOpen] = useState(false);
  const [newLoteData, setNewLoteData] = useState({
    convenioId: '',
    competencia: `${new Date().getMonth() + 1}/${new Date().getFullYear()}`
  });
  const [availableGuias, setAvailableGuias] = useState<GuiaTISS[]>([]);
  const [selectedGuiasIds, setSelectedGuiasIds] = useState<string[]>([]);

  useEffect(() => {
    loadLotes();
    
    const handleUpdate = () => {
      loadLotes();
    };
    
    window.addEventListener('loteCreated', handleUpdate);
    
    return () => {
      window.removeEventListener('loteCreated', handleUpdate);
    };
  }, []);

  const loadLotes = () => {
    const allLotes = tissService.getAllLotes();
    setLotes(allLotes);
  };

  const handleNewLote = useCallback(() => {
    setNewLoteData({
      convenioId: '',
      competencia: `${new Date().getMonth() + 1}/${new Date().getFullYear()}`
    });
    setDialogOpen(true);
  }, []);

  useEffect(() => {
    const handleOpenNewLote = () => {
      handleNewLote();
    };
    
    window.addEventListener('openNewLoteDialog', handleOpenNewLote);
    
    return () => {
      window.removeEventListener('openNewLoteDialog', handleOpenNewLote);
    };
  }, [handleNewLote]);

  const handleCreateLote = () => {
    if (!newLoteData.convenioId) {
      toast.error("Selecione um convênio");
      return;
    }

    const convenio = tissService.getConvenioById(parseInt(newLoteData.convenioId));
    if (!convenio) {
      toast.error("Convênio não encontrado");
      return;
    }

    const lote = tissService.createLote({
      convenioId: convenio.id,
      convenioNome: convenio.nome,
      competencia: newLoteData.competencia,
      status: 'ABERTO',
      guias: [],
      valorTotal: 0
    });

    toast.success("Lote criado com sucesso!");
    setDialogOpen(false);
    loadLotes();
    
    // Abrir dialog para adicionar guias
    setTimeout(() => {
      setSelectedLote(lote);
      handleAddGuias(lote);
    }, 300);
  };

  const handleAddGuias = (lote: LoteFaturamento) => {
    setSelectedLote(lote);
    // Buscar guias finalizadas do mesmo convênio que não estão em nenhum lote
    const allGuias = tissService.getAllGuias();
    const guiasDisponiveis = allGuias.filter(g => 
      g.convenioId === lote.convenioId &&
      g.status === 'FINALIZADA' &&
      !g.loteId
    );
    setAvailableGuias(guiasDisponiveis);
    setSelectedGuiasIds([]);
    setAddGuiasDialogOpen(true);
  };

  const handleSaveGuiasToLote = () => {
    if (!selectedLote || selectedGuiasIds.length === 0) {
      toast.error("Selecione pelo menos uma guia");
      return;
    }

    const guiasSelecionadas = availableGuias.filter(g => selectedGuiasIds.includes(g.id));
    const valorTotal = guiasSelecionadas.reduce((sum, g) => sum + g.valorTotal, 0);

    // Atualizar guias com loteId
    guiasSelecionadas.forEach(guia => {
      tissService.updateGuia(guia.id, { loteId: selectedLote.id });
    });

    // Atualizar lote
    tissService.updateLote(selectedLote.id, {
      guias: [...selectedLote.guias, ...selectedGuiasIds],
      valorTotal: selectedLote.valorTotal + valorTotal
    });

    toast.success(`${selectedGuiasIds.length} guia(s) adicionada(s) ao lote!`);
    setAddGuiasDialogOpen(false);
    loadLotes();
  };

  const handleFecharLote = (lote: LoteFaturamento) => {
    if (lote.guias.length === 0) {
      toast.error("Adicione guias ao lote antes de fechar");
      return;
    }

    if (confirm(`Tem certeza que deseja fechar o lote ${lote.numeroLote}?`)) {
      tissService.updateLote(lote.id, {
        status: 'FECHADO',
        dataFechamento: new Date().toISOString()
      });
      toast.success("Lote fechado com sucesso!");
      loadLotes();
    }
  };

  const handleViewLote = (lote: LoteFaturamento) => {
    setSelectedLote(lote);
    setViewDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      ABERTO: { variant: 'secondary', label: 'Aberto' },
      FECHADO: { variant: 'default', label: 'Fechado' },
      ENVIADO: { variant: 'outline', label: 'Enviado' },
      PROCESSADO: { variant: 'default', label: 'Processado', className: 'bg-green-500' },
      CANCELADO: { variant: 'destructive', label: 'Cancelado' }
    };
    const config = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Lotes de Faturamento</CardTitle>
            <Button onClick={handleNewLote} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Novo Lote
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Convênio</TableHead>
                <TableHead>Competência</TableHead>
                <TableHead>Guias</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum lote encontrado
                  </TableCell>
                </TableRow>
              ) : (
                lotes.map((lote) => (
                  <TableRow key={lote.id}>
                    <TableCell className="font-medium">{lote.numeroLote}</TableCell>
                    <TableCell>{lote.convenioNome}</TableCell>
                    <TableCell>{lote.competencia}</TableCell>
                    <TableCell>{lote.guias.length}</TableCell>
                    <TableCell>{formatCurrency(lote.valorTotal)}</TableCell>
                    <TableCell>{getStatusBadge(lote.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleViewLote(lote)}>
                          <Eye className="h-4 w-4 text-blue-500" />
                        </Button>
                        {lote.status === 'ABERTO' && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleAddGuias(lote)}>
                              <Plus className="h-4 w-4 text-primary" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleFecharLote(lote)}>
                              <Lock className="h-4 w-4 text-green-500" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Criar Lote */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Lote de Faturamento</DialogTitle>
            <DialogDescription>
              Crie um novo lote para agrupar guias TISS
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Convênio *</label>
              <Select
                value={newLoteData.convenioId}
                onValueChange={(value) => setNewLoteData({ ...newLoteData, convenioId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o convênio" />
                </SelectTrigger>
                <SelectContent>
                  {tissService.getAllConvenios().map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Competência (MM/AAAA)</label>
              <Input
                placeholder="01/2024"
                value={newLoteData.competencia}
                onChange={(e) => setNewLoteData({ ...newLoteData, competencia: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateLote} className="bg-primary hover:bg-primary/90">
              Criar Lote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Adicionar Guias */}
      <Dialog open={addGuiasDialogOpen} onOpenChange={setAddGuiasDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Guias ao Lote</DialogTitle>
            <DialogDescription>
              Selecione as guias finalizadas para adicionar ao lote {selectedLote?.numeroLote}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {availableGuias.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma guia finalizada disponível para este convênio
              </p>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {availableGuias.map((guia) => (
                    <div
                      key={guia.id}
                      className="flex items-center gap-3 p-3 border rounded hover:bg-accent cursor-pointer"
                      onClick={() => {
                        if (selectedGuiasIds.includes(guia.id)) {
                          setSelectedGuiasIds(selectedGuiasIds.filter(id => id !== guia.id));
                        } else {
                          setSelectedGuiasIds([...selectedGuiasIds, guia.id]);
                        }
                      }}
                    >
                      <Checkbox
                        checked={selectedGuiasIds.includes(guia.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedGuiasIds([...selectedGuiasIds, guia.id]);
                          } else {
                            setSelectedGuiasIds(selectedGuiasIds.filter(id => id !== guia.id));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{guia.numeroGuia}</p>
                        <p className="text-xs text-muted-foreground">
                          {guia.pacienteNome} - {formatCurrency(guia.valorTotal)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            {selectedGuiasIds.length > 0 && (
              <div className="p-3 bg-muted rounded">
                <p className="text-sm font-medium">
                  {selectedGuiasIds.length} guia(s) selecionada(s) - Total: {formatCurrency(
                    availableGuias
                      .filter(g => selectedGuiasIds.includes(g.id))
                      .reduce((sum, g) => sum + g.valorTotal, 0)
                  )}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddGuiasDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveGuiasToLote}
              disabled={selectedGuiasIds.length === 0}
              className="bg-primary hover:bg-primary/90"
            >
              Adicionar {selectedGuiasIds.length > 0 && `(${selectedGuiasIds.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Visualizar Lote */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Lote {selectedLote?.numeroLote}</DialogTitle>
            <DialogDescription>
              Informações completas do lote de faturamento
            </DialogDescription>
          </DialogHeader>
          {selectedLote && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Convênio</p>
                  <p className="font-semibold">{selectedLote.convenioNome}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Competência</p>
                  <p className="font-semibold">{selectedLote.competencia}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  {getStatusBadge(selectedLote.status)}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Valor Total</p>
                  <p className="font-semibold text-lg">{formatCurrency(selectedLote.valorTotal)}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-semibold mb-2">Guias no Lote ({selectedLote.guias.length})</p>
                {selectedLote.guias.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma guia adicionada</p>
                ) : (
                  <ScrollArea className="h-[300px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Número</TableHead>
                          <TableHead>Paciente</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tissService.getAllGuias()
                          .filter(g => selectedLote.guias.includes(g.id))
                          .map((guia) => (
                            <TableRow key={guia.id}>
                              <TableCell className="font-medium">{guia.numeroGuia}</TableCell>
                              <TableCell>{guia.pacienteNome}</TableCell>
                              <TableCell>
                                {new Date(guia.dataAtendimento).toLocaleDateString('pt-BR')}
                              </TableCell>
                              <TableCell>{formatCurrency(guia.valorTotal)}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


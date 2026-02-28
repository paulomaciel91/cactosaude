import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Search, Edit, Trash2, Printer, Eye, FileText, X, AlertCircle } from 'lucide-react';
import { tissService, GuiaTISS, ProcedimentoTUSS } from '@/lib/tissService';
import { validators } from '@/lib/validators';
import { CID10Search } from './CID10Search';
import { TUSSSearch } from './TUSSSearch';
import { CID10, cid10Service } from '@/lib/cid10Table';
import { ProcedimentoTUSS as TUSSProc } from '@/lib/tussTable';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const GuiasTISS = () => {
  const [guias, setGuias] = useState<GuiaTISS[]>([]);
  const [filteredGuias, setFilteredGuias] = useState<GuiaTISS[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterConvenio, setFilterConvenio] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedGuia, setSelectedGuia] = useState<GuiaTISS | null>(null);
  const [formData, setFormData] = useState<Partial<GuiaTISS>>({});
  const [procedimentos, setProcedimentos] = useState<Array<ProcedimentoTUSS & { quantidade: number; valorUnitario: number; dataRealizacao: string }>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cid10Selected, setCid10Selected] = useState<CID10 | null>(null);
  const [convenios, setConvenios] = useState<any[]>([]);

  useEffect(() => {
    loadGuias();
    loadConvenios();
    
    const handleUpdate = () => {
      loadGuias();
    };
    
    const handleConvenioUpdate = () => {
      loadConvenios();
    };
    
    window.addEventListener('guiaCreated', handleUpdate);
    window.addEventListener('guiaUpdated', handleUpdate);
    window.addEventListener('convenioCreated', handleConvenioUpdate);
    window.addEventListener('convenioUpdated', handleConvenioUpdate);
    
    return () => {
      window.removeEventListener('guiaCreated', handleUpdate);
      window.removeEventListener('guiaUpdated', handleUpdate);
      window.removeEventListener('convenioCreated', handleConvenioUpdate);
      window.removeEventListener('convenioUpdated', handleConvenioUpdate);
    };
  }, []);

  const loadConvenios = () => {
    const allConvenios = tissService.getAllConvenios();
    setConvenios(allConvenios);
  };

  useEffect(() => {
    filterGuias();
  }, [guias, searchTerm, filterConvenio, filterStatus]);

  const loadGuias = () => {
    const allGuias = tissService.getAllGuias();
    setGuias(allGuias);
  };

  const filterGuias = () => {
    let filtered = [...guias];

    if (searchTerm) {
      filtered = filtered.filter(g =>
        g.numeroGuia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.pacienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.convenioNome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterConvenio !== 'all') {
      filtered = filtered.filter(g => g.convenioId.toString() === filterConvenio);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(g => g.status === filterStatus);
    }

    setFilteredGuias(filtered);
  };

  const handleNewGuia = useCallback(() => {
    setSelectedGuia(null);
    setFormData({
      tipoGuia: 'CONSULTA',
      status: 'RASCUNHO',
      dataAtendimento: new Date().toISOString().split('T')[0],
      dataEmissao: new Date().toISOString().split('T')[0],
      procedimentos: [],
      valorTotal: 0,
      profissionalCrm: '',
      profissionalCrmEstado: 'SP',
      profissionalCbo: '',
      profissionalNome: 'Dr. João Santos'
    });
    setProcedimentos([]);
    setCid10Selected(null);
    setErrors({});
    setDialogOpen(true);
  }, []);

  useEffect(() => {
    const handleOpenNewGuia = (event: any) => {
      if (event.detail) {
        // Se há dados do paciente, preencher o formulário
        const patientData = event.detail;
        setSelectedGuia(null);
        setFormData({
          tipoGuia: 'CONSULTA',
          status: 'RASCUNHO',
          dataAtendimento: patientData.dataAtendimento || new Date().toISOString().split('T')[0],
          dataEmissao: new Date().toISOString().split('T')[0],
          procedimentos: [],
          valorTotal: 0,
          profissionalCrm: patientData.profissionalCrm || '',
          profissionalCrmEstado: patientData.profissionalCrmEstado || 'SP',
          profissionalCbo: patientData.profissionalCbo || '',
          profissionalNome: patientData.profissionalNome || 'Dr. João Santos',
          pacienteId: patientData.pacienteId,
          pacienteNome: patientData.pacienteNome,
          pacienteCpf: patientData.pacienteCpf,
          pacienteCarteirinha: patientData.pacienteCarteirinha,
          pacienteValidadeCarteirinha: patientData.pacienteValidadeCarteirinha,
          convenioId: patientData.convenioId,
          convenioNome: patientData.convenioNome,
          cid10: patientData.cid10,
          cid10Descricao: patientData.cid10Descricao,
          indicacaoClinica: patientData.indicacaoClinica,
          observacoes: ''
        });
        setProcedimentos([]);
        setCid10Selected(patientData.cid10 ? { code: patientData.cid10, description: patientData.cid10Descricao } : null);
        setErrors({});
        setDialogOpen(true);
      } else {
        handleNewGuia();
      }
    };
    
    window.addEventListener('openNewGuiaDialog', handleOpenNewGuia as EventListener);
    
    return () => {
      window.removeEventListener('openNewGuiaDialog', handleOpenNewGuia as EventListener);
    };
  }, [handleNewGuia]);

  const handleEditGuia = (guia: GuiaTISS) => {
    setSelectedGuia(guia);
    setFormData(guia);
    setProcedimentos(guia.procedimentos.map(p => ({
      ...p,
      quantidade: p.quantidade,
      valorUnitario: p.valorUnitario,
      dataRealizacao: p.dataRealizacao
    })));
    if (guia.cid10) {
      const cid = cid10Service.getByCode(guia.cid10);
      if (cid) setCid10Selected(cid);
    }
    setErrors({});
    setDialogOpen(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.convenioId) {
      newErrors.convenio = 'Selecione um convênio';
    }

    if (!formData.pacienteNome || formData.pacienteNome.trim().length < 3) {
      newErrors.pacienteNome = 'Nome do paciente é obrigatório';
    }

    if (formData.pacienteCpf && !validators.cpf(formData.pacienteCpf)) {
      newErrors.pacienteCpf = 'CPF inválido';
    }

    if (formData.pacienteCarteirinha && !validators.carteirinha(formData.pacienteCarteirinha)) {
      newErrors.pacienteCarteirinha = 'Carteirinha inválida';
    }

    if (!cid10Selected) {
      newErrors.cid10 = 'Selecione um CID-10';
    }

    if (!formData.profissionalCrm || formData.profissionalCrm.trim().length < 4) {
      newErrors.profissionalCrm = 'CRM do profissional é obrigatório';
    }

    if (procedimentos.length === 0) {
      newErrors.procedimentos = 'Adicione pelo menos um procedimento';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddProcedimento = (proc: TUSSProc) => {
    const novoProc: ProcedimentoTUSS & { quantidade: number; valorUnitario: number; dataRealizacao: string } = {
      codigoTUSS: proc.codigo,
      descricao: proc.descricao,
      quantidade: 1,
      valorUnitario: proc.valorBase || 0,
      valorTotal: proc.valorBase || 0,
      dataRealizacao: formData.dataAtendimento || new Date().toISOString().split('T')[0]
    };
    setProcedimentos([...procedimentos, novoProc]);
    updateValorTotal();
  };

  const handleRemoveProcedimento = (index: number) => {
    const novos = procedimentos.filter((_, i) => i !== index);
    setProcedimentos(novos);
    updateValorTotal();
  };

  const handleUpdateProcedimento = (index: number, field: string, value: any) => {
    const novos = [...procedimentos];
    novos[index] = { ...novos[index], [field]: value };
    if (field === 'quantidade' || field === 'valorUnitario') {
      novos[index].valorTotal = novos[index].quantidade * novos[index].valorUnitario;
    }
    setProcedimentos(novos);
    updateValorTotal();
  };

  const updateValorTotal = () => {
    const total = procedimentos.reduce((sum, p) => sum + p.valorTotal, 0);
    setFormData({ ...formData, valorTotal: total });
  };

  const handleSaveGuia = () => {
    if (!validateForm()) {
      toast.error("Corrija os erros antes de salvar");
      return;
    }

    const guiaData: Partial<GuiaTISS> = {
      ...formData,
      cid10: cid10Selected?.codigo || '',
      cid10Descricao: cid10Selected?.descricao || '',
      procedimentos: procedimentos.map(p => ({
        codigoTUSS: p.codigoTUSS,
        descricao: p.descricao,
        quantidade: p.quantidade,
        valorUnitario: p.valorUnitario,
        valorTotal: p.valorTotal,
        dataRealizacao: p.dataRealizacao
      })),
      valorTotal: procedimentos.reduce((sum, p) => sum + p.valorTotal, 0),
      pacienteId: formData.pacienteId || 1 // Mock - em produção viria da seleção
    };

    if (selectedGuia) {
      tissService.updateGuia(selectedGuia.id, guiaData as Partial<GuiaTISS>);
      toast.success("Guia atualizada com sucesso!");
    } else {
      tissService.createGuia(guiaData as Omit<GuiaTISS, 'id' | 'numeroGuia' | 'createdAt' | 'updatedAt'>);
      toast.success("Guia criada com sucesso!");
    }
    
    setDialogOpen(false);
    loadGuias();
  };

  const handleDeleteGuia = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta guia?")) {
      tissService.deleteGuia(id);
      toast.success("Guia excluída com sucesso!");
      loadGuias();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      RASCUNHO: { variant: 'secondary', label: 'Rascunho' },
      FINALIZADA: { variant: 'default', label: 'Finalizada' },
      ENVIADA: { variant: 'outline', label: 'Enviada' },
      PAGA: { variant: 'default', label: 'Paga', className: 'bg-green-500' },
      GLOSADA: { variant: 'destructive', label: 'Glosada' },
      CANCELADA: { variant: 'secondary', label: 'Cancelada' }
    };
    const config = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Header com filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Guias TISS</CardTitle>
            <Button onClick={handleNewGuia} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Nova Guia
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número, paciente ou convênio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filterConvenio} onValueChange={setFilterConvenio}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todos os convênios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os convênios</SelectItem>
                {convenios.filter(c => c.ativo !== false).map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="RASCUNHO">Rascunho</SelectItem>
                <SelectItem value="FINALIZADA">Finalizada</SelectItem>
                <SelectItem value="ENVIADA">Enviada</SelectItem>
                <SelectItem value="PAGA">Paga</SelectItem>
                <SelectItem value="GLOSADA">Glosada</SelectItem>
                <SelectItem value="CANCELADA">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Guias */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Convênio</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[140px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGuias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhuma guia encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredGuias.map((guia) => (
                  <TableRow key={guia.id}>
                    <TableCell className="font-medium">{guia.numeroGuia}</TableCell>
                    <TableCell>{guia.tipoGuia.replace('_', '/')}</TableCell>
                    <TableCell>{guia.pacienteNome}</TableCell>
                    <TableCell>{guia.convenioNome}</TableCell>
                    <TableCell>
                      {new Date(guia.dataAtendimento).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>{formatCurrency(guia.valorTotal)}</TableCell>
                    <TableCell>{getStatusBadge(guia.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditGuia(guia)}>
                          <Edit className="h-4 w-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Printer className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGuia(guia.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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

      {/* Dialog de Criação/Edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedGuia ? 'Editar Guia TISS' : 'Nova Guia TISS'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados da guia TISS
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Tipo de Guia */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Guia</Label>
                <Select
                  value={formData.tipoGuia}
                  onValueChange={(value) => setFormData({ ...formData, tipoGuia: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONSULTA">Consulta</SelectItem>
                    <SelectItem value="SP_SADT">SP/SADT</SelectItem>
                    <SelectItem value="HONORARIOS">Honorários</SelectItem>
                    <SelectItem value="AUTORIZACAO">Autorização</SelectItem>
                    <SelectItem value="INTERNACAO">Internação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RASCUNHO">Rascunho</SelectItem>
                    <SelectItem value="FINALIZADA">Finalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Convênio */}
            <div className="space-y-2">
              <Label>Convênio *</Label>
              <Select
                value={formData.convenioId?.toString() || ''}
                onValueChange={(value) => {
                  const convenio = convenios.find(c => c.id.toString() === value);
                  if (convenio) {
                    setFormData({
                      ...formData,
                      convenioId: convenio.id,
                      convenioNome: convenio.nome
                    });
                  }
                }}
              >
                <SelectTrigger className={errors.convenio ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o convênio" />
                </SelectTrigger>
                <SelectContent>
                  {convenios.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      Nenhum convênio cadastrado. Cadastre em Configurações → Convênios
                    </div>
                  ) : (
                    convenios.filter(c => c.ativo !== false).map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.nome} {c.codigoANS && `(${c.codigoANS})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.convenio && (
                <p className="text-xs text-red-500">{errors.convenio}</p>
              )}
              {convenios.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Nenhum convênio cadastrado. <a href="#configuracoes" className="text-primary underline">Cadastre em Configurações</a>
                </p>
              )}
            </div>

            {/* Dados do Paciente */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Dados do Paciente</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Paciente *</Label>
                  <Input
                    placeholder="Nome completo"
                    value={formData.pacienteNome || ''}
                    onChange={(e) => setFormData({ ...formData, pacienteNome: e.target.value })}
                    className={errors.pacienteNome ? 'border-red-500' : ''}
                  />
                  {errors.pacienteNome && (
                    <p className="text-xs text-red-500">{errors.pacienteNome}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>CPF</Label>
                  <Input
                    placeholder="000.000.000-00"
                    value={formData.pacienteCpf || ''}
                    onChange={(e) => {
                      const formatted = validators.formatCPF(e.target.value);
                      setFormData({ ...formData, pacienteCpf: formatted });
                    }}
                    className={errors.pacienteCpf ? 'border-red-500' : ''}
                  />
                  {errors.pacienteCpf && (
                    <p className="text-xs text-red-500">{errors.pacienteCpf}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Carteirinha</Label>
                  <Input
                    placeholder="Número da carteirinha"
                    value={formData.pacienteCarteirinha || ''}
                    onChange={(e) => setFormData({ ...formData, pacienteCarteirinha: e.target.value })}
                    className={errors.pacienteCarteirinha ? 'border-red-500' : ''}
                  />
                  {errors.pacienteCarteirinha && (
                    <p className="text-xs text-red-500">{errors.pacienteCarteirinha}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Validade da Carteirinha</Label>
                  <Input
                    type="date"
                    value={formData.pacienteValidadeCarteirinha || ''}
                    onChange={(e) => setFormData({ ...formData, pacienteValidadeCarteirinha: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data do Atendimento</Label>
                  <Input
                    type="date"
                    value={formData.dataAtendimento || ''}
                    onChange={(e) => setFormData({ ...formData, dataAtendimento: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Dados do Profissional */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Dados do Profissional</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Profissional</Label>
                  <Input
                    placeholder="Nome completo"
                    value={formData.profissionalNome || ''}
                    onChange={(e) => setFormData({ ...formData, profissionalNome: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CRM *</Label>
                  <Input
                    placeholder="000000"
                    value={formData.profissionalCrm || ''}
                    onChange={(e) => setFormData({ ...formData, profissionalCrm: e.target.value })}
                    className={errors.profissionalCrm ? 'border-red-500' : ''}
                  />
                  {errors.profissionalCrm && (
                    <p className="text-xs text-red-500">{errors.profissionalCrm}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Estado CRM</Label>
                  <Select
                    value={formData.profissionalCrmEstado || 'SP'}
                    onValueChange={(value) => setFormData({ ...formData, profissionalCrmEstado: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(estado => (
                        <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>CBO</Label>
                  <Input
                    placeholder="Código CBO"
                    value={formData.profissionalCbo || ''}
                    onChange={(e) => setFormData({ ...formData, profissionalCbo: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* CID-10 */}
            <div className="space-y-2">
              <Label>CID-10 (Indicação Clínica) *</Label>
              <CID10Search
                onSelect={(cid) => {
                  setCid10Selected(cid);
                  setFormData({ ...formData, cid10: cid.codigo, cid10Descricao: cid.descricao });
                }}
                value={cid10Selected ? `${cid10Selected.codigo} - ${cid10Selected.descricao}` : ''}
              />
              {errors.cid10 && (
                <p className="text-xs text-red-500">{errors.cid10}</p>
              )}
              {cid10Selected && (
                <div className="p-2 bg-muted rounded text-sm">
                  <strong>{cid10Selected.codigo}</strong> - {cid10Selected.descricao}
                </div>
              )}
            </div>

            {/* Indicação Clínica */}
            <div className="space-y-2">
              <Label>Indicação Clínica</Label>
              <Textarea
                placeholder="Descreva a indicação clínica..."
                value={formData.indicacaoClinica || ''}
                onChange={(e) => setFormData({ ...formData, indicacaoClinica: e.target.value })}
                rows={3}
              />
            </div>

            {/* Procedimentos TUSS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Procedimentos TUSS *</h3>
                {errors.procedimentos && (
                  <p className="text-xs text-red-500">{errors.procedimentos}</p>
                )}
              </div>
              
              <TUSSSearch onSelect={handleAddProcedimento} />
              
              {procedimentos.length > 0 && (
                <div className="space-y-2">
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Código</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead className="w-[100px]">Quantidade</TableHead>
                          <TableHead className="w-[120px]">Valor Unit.</TableHead>
                          <TableHead className="w-[120px]">Valor Total</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {procedimentos.map((proc, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono text-xs">{proc.codigoTUSS}</TableCell>
                            <TableCell className="text-sm">{proc.descricao}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="1"
                                value={proc.quantidade}
                                onChange={(e) => handleUpdateProcedimento(idx, 'quantidade', parseInt(e.target.value) || 1)}
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={proc.valorUnitario}
                                onChange={(e) => handleUpdateProcedimento(idx, 'valorUnitario', parseFloat(e.target.value) || 0)}
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(proc.valorTotal)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveProcedimento(idx)}
                              >
                                <X className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-end">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Valor Total</p>
                      <p className="text-xl font-bold">
                        {formatCurrency(procedimentos.reduce((sum, p) => sum + p.valorTotal, 0))}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                placeholder="Observações sobre a guia..."
                value={formData.observacoes || ''}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={3}
              />
            </div>

            {/* Alertas de Erro */}
            {Object.keys(errors).length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Corrija os erros indicados antes de salvar a guia.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveGuia} className="bg-primary hover:bg-primary/90">
              {selectedGuia ? 'Atualizar' : 'Salvar'} Guia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


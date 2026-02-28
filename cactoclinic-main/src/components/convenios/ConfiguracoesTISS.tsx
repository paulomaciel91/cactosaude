import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Building2, FileCode, Shield, Bell, Plus, Edit, Trash2, Search } from 'lucide-react';
import { tissService, ConfiguracaoTISS, Convenio } from '@/lib/tissService';
import { toast } from 'sonner';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const ConfiguracoesTISS = () => {
  const [config, setConfig] = useState<ConfiguracaoTISS | null>(null);
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [convenioDialogOpen, setConvenioDialogOpen] = useState(false);
  const [selectedConvenio, setSelectedConvenio] = useState<Convenio | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [convenioToDelete, setConvenioToDelete] = useState<Convenio | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [convenioFormData, setConvenioFormData] = useState<Partial<Convenio>>({});

  useEffect(() => {
    loadConfig();
    loadConvenios();
  }, []);

  const loadConfig = () => {
    const savedConfig = tissService.getConfig();
    if (savedConfig) {
      setConfig(savedConfig);
    } else {
      // Configuração padrão
      setConfig({
        prestador: {
          razaoSocial: '',
          cnpj: '',
          cnes: '',
          codigoANS: '',
          endereco: '',
          cidade: '',
          estado: '',
          cep: '',
          telefone: '',
          email: '',
          responsavelTecnico: '',
          responsavelTecnicoCRM: ''
        },
        versaoTISS: '4.0',
        schemaXSD: '',
        formatoNumeracao: {
          guias: '',
          lotes: ''
        },
        validacoes: {
          validarCPF: true,
          validarCarteirinha: true,
          validarCID10: true,
          validarTUSS: true,
          validarCarencias: true,
          validarAutorizacao: true
        },
        notificacoes: {
          guiasPendentes: true,
          glosas: true,
          prazos: true,
          canais: ['sistema', 'email']
        }
      });
    }
  };

  const loadConvenios = () => {
    const allConvenios = tissService.getAllConvenios();
    setConvenios(allConvenios);
  };

  const handleSave = () => {
    if (config) {
      tissService.saveConfig(config);
      toast.success("Configurações salvas com sucesso!");
    }
  };

  const handleNewConvenio = () => {
    setSelectedConvenio(null);
    setConvenioFormData({
      nome: '',
      codigoANS: '',
      cnpj: '',
      codigoPrestador: '',
      email: '',
      tabelaPrecos: 'TUSS',
      diasParaPagamento: 30,
      ativo: true
    });
    setConvenioDialogOpen(true);
  };

  const handleEditConvenio = (convenio: Convenio) => {
    setSelectedConvenio(convenio);
    setConvenioFormData(convenio);
    setConvenioDialogOpen(true);
  };

  const handleSaveConvenio = () => {
    if (!convenioFormData.nome || !convenioFormData.codigoANS) {
      toast.error("Preencha nome e código ANS");
      return;
    }

    if (selectedConvenio) {
      tissService.updateConvenio(selectedConvenio.id, convenioFormData as Partial<Convenio>);
      toast.success("Convênio atualizado com sucesso!");
    } else {
      tissService.createConvenio(convenioFormData as Omit<Convenio, 'id' | 'createdAt'>);
      toast.success("Convênio criado com sucesso!");
    }
    
    setConvenioDialogOpen(false);
    loadConvenios();
  };

  const handleDeleteConvenio = (convenio: Convenio) => {
    setConvenioToDelete(convenio);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteConvenio = () => {
    if (convenioToDelete) {
      tissService.deleteConvenio(convenioToDelete.id);
      toast.success("Convênio excluído com sucesso!");
      loadConvenios();
    }
    setDeleteDialogOpen(false);
    setConvenioToDelete(null);
  };

  const filteredConvenios = convenios.filter(c =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.codigoANS.includes(searchTerm) ||
    c.cnpj.includes(searchTerm)
  );

  if (!config) return null;

  return (
    <div className="space-y-4">
      <Tabs defaultValue="prestador" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="prestador">
            <Building2 className="h-4 w-4 mr-2" />
            Prestador
          </TabsTrigger>
          <TabsTrigger value="convenios">
            <Building2 className="h-4 w-4 mr-2" />
            Convênios
          </TabsTrigger>
          <TabsTrigger value="geracao">
            <FileCode className="h-4 w-4 mr-2" />
            Geração
          </TabsTrigger>
          <TabsTrigger value="validacoes">
            <Shield className="h-4 w-4 mr-2" />
            Validações
          </TabsTrigger>
          <TabsTrigger value="notificacoes">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </TabsTrigger>
        </TabsList>

        {/* Dados do Prestador */}
        <TabsContent value="prestador" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dados do Prestador</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Razão Social</Label>
                  <Input
                    value={config.prestador.razaoSocial}
                    onChange={(e) => setConfig({
                      ...config,
                      prestador: { ...config.prestador, razaoSocial: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input
                    value={config.prestador.cnpj}
                    onChange={(e) => setConfig({
                      ...config,
                      prestador: { ...config.prestador, cnpj: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CNES</Label>
                  <Input
                    value={config.prestador.cnes}
                    onChange={(e) => setConfig({
                      ...config,
                      prestador: { ...config.prestador, cnes: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Código ANS</Label>
                  <Input
                    value={config.prestador.codigoANS}
                    onChange={(e) => setConfig({
                      ...config,
                      prestador: { ...config.prestador, codigoANS: e.target.value }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Convênios */}
        <TabsContent value="convenios" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Cadastro de Convênios</CardTitle>
                <Button onClick={handleNewConvenio} className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Convênio
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar convênio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              {filteredConvenios.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'Nenhum convênio encontrado' : 'Nenhum convênio cadastrado'}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Código ANS</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Tabela</TableHead>
                      <TableHead>Dias Pag.</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[120px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredConvenios.map((convenio) => (
                      <TableRow key={convenio.id}>
                        <TableCell className="font-medium">{convenio.nome}</TableCell>
                        <TableCell>{convenio.codigoANS}</TableCell>
                        <TableCell>{convenio.cnpj}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{convenio.tabelaPrecos}</Badge>
                        </TableCell>
                        <TableCell>{convenio.diasParaPagamento} dias</TableCell>
                        <TableCell>
                          <Badge variant={convenio.ativo ? 'default' : 'secondary'}>
                            {convenio.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditConvenio(convenio)}
                            >
                              <Edit className="h-4 w-4 text-primary" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteConvenio(convenio)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geração */}
        <TabsContent value="geracao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configurações de Geração</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Versão TISS</Label>
                <Select
                  value={config.versaoTISS}
                  onValueChange={(value) => setConfig({ ...config, versaoTISS: value as '4.0' | '3.04.01' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4.0">4.0</SelectItem>
                    <SelectItem value="3.04.01">3.04.01</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validações */}
        <TabsContent value="validacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Validações Obrigatórias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Validar CPF</Label>
                <Switch
                  checked={config.validacoes.validarCPF}
                  onCheckedChange={(checked) => setConfig({
                    ...config,
                    validacoes: { ...config.validacoes, validarCPF: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Validar Carteirinha</Label>
                <Switch
                  checked={config.validacoes.validarCarteirinha}
                  onCheckedChange={(checked) => setConfig({
                    ...config,
                    validacoes: { ...config.validacoes, validarCarteirinha: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Validar CID-10</Label>
                <Switch
                  checked={config.validacoes.validarCID10}
                  onCheckedChange={(checked) => setConfig({
                    ...config,
                    validacoes: { ...config.validacoes, validarCID10: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Validar Código TUSS</Label>
                <Switch
                  checked={config.validacoes.validarTUSS}
                  onCheckedChange={(checked) => setConfig({
                    ...config,
                    validacoes: { ...config.validacoes, validarTUSS: checked }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificações */}
        <TabsContent value="notificacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notificações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Alertar sobre guias pendentes</Label>
                <Switch
                  checked={config.notificacoes.guiasPendentes}
                  onCheckedChange={(checked) => setConfig({
                    ...config,
                    notificacoes: { ...config.notificacoes, guiasPendentes: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Alertar sobre glosas</Label>
                <Switch
                  checked={config.notificacoes.glosas}
                  onCheckedChange={(checked) => setConfig({
                    ...config,
                    notificacoes: { ...config.notificacoes, glosas: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Alertar sobre prazos</Label>
                <Switch
                  checked={config.notificacoes.prazos}
                  onCheckedChange={(checked) => setConfig({
                    ...config,
                    notificacoes: { ...config.notificacoes, prazos: checked }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
          Salvar Configurações
        </Button>
      </div>

      {/* Dialog Criar/Editar Convênio */}
      <Dialog open={convenioDialogOpen} onOpenChange={setConvenioDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedConvenio ? 'Editar Convênio' : 'Novo Convênio'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do convênio/operadora
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Convênio *</Label>
                <Input
                  placeholder="Ex: Unimed, Amil, SulAmérica..."
                  value={convenioFormData.nome || ''}
                  onChange={(e) => setConvenioFormData({ ...convenioFormData, nome: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Código ANS *</Label>
                <Input
                  placeholder="Código na ANS"
                  value={convenioFormData.codigoANS || ''}
                  onChange={(e) => setConvenioFormData({ ...convenioFormData, codigoANS: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>CNPJ</Label>
                <Input
                  placeholder="00.000.000/0000-00"
                  value={convenioFormData.cnpj || ''}
                  onChange={(e) => setConvenioFormData({ ...convenioFormData, cnpj: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Código do Prestador</Label>
                <Input
                  placeholder="Código do prestador no convênio"
                  value={convenioFormData.codigoPrestador || ''}
                  onChange={(e) => setConvenioFormData({ ...convenioFormData, codigoPrestador: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="email@convenio.com.br"
                  value={convenioFormData.email || ''}
                  onChange={(e) => setConvenioFormData({ ...convenioFormData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tabela de Preços</Label>
                <Select
                  value={convenioFormData.tabelaPrecos}
                  onValueChange={(value) => setConvenioFormData({ ...convenioFormData, tabelaPrecos: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TUSS">TUSS</SelectItem>
                    <SelectItem value="PROPRIA">Própria</SelectItem>
                    <SelectItem value="PERCENTUAL">Percentual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {convenioFormData.tabelaPrecos === 'PERCENTUAL' && (
                <div className="space-y-2">
                  <Label>Percentual sobre Tabela Base (%)</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 120"
                    value={convenioFormData.percentualSobreTabela || ''}
                    onChange={(e) => setConvenioFormData({ 
                      ...convenioFormData, 
                      percentualSobreTabela: parseFloat(e.target.value) || undefined 
                    })}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Dias para Pagamento</Label>
                <Input
                  type="number"
                  placeholder="30"
                  value={convenioFormData.diasParaPagamento || ''}
                  onChange={(e) => setConvenioFormData({ 
                    ...convenioFormData, 
                    diasParaPagamento: parseInt(e.target.value) || 30 
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Webhook n8n (opcional)</Label>
                <Input
                  placeholder="https://..."
                  value={convenioFormData.webhookN8N || ''}
                  onChange={(e) => setConvenioFormData({ ...convenioFormData, webhookN8N: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={convenioFormData.ativo !== false}
                  onChange={(e) => setConvenioFormData({ ...convenioFormData, ativo: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="ativo" className="cursor-pointer">Convênio ativo</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConvenioDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveConvenio} className="bg-primary hover:bg-primary/90">
              {selectedConvenio ? 'Atualizar' : 'Criar'} Convênio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmar Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o convênio "{convenioToDelete?.nome}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteConvenio}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};


import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, Plus, Search, Edit, Trash2, Pause, Play, XCircle, History, DollarSign, X, Filter, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ClinicEnabledModules, saveClinicEnabledModules, getClinicEnabledModules } from "@/lib/clinicPermissionService";
import { Switch } from "@/components/ui/switch";

interface Clinic {
  id: number;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  users: number;
  plan: string;
  status: "active" | "pending" | "suspended";
  subscriptionStart: string;
  lastPayment: string | null;
  nextPayment: string;
  monthlyValue: number;
  address?: string;
  enabledModules?: ClinicEnabledModules;
}

const AdminClinicas = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    email: "",
    phone: "",
    plan: "Profissional",
    userLimit: "",
    address: "",
  });

  const [enabledModules, setEnabledModules] = useState<ClinicEnabledModules>({
    Dashboard: true,
    Agenda: true,
    Consulta: true,
    Pacientes: true,
    CRM: true,
    Financeiro: true,
    Pagamentos: true,
    Equipe: true,
    Estoque: true,
    Comunicação: true,
    Relatórios: true,
    Suporte: true,
    Configurações: true,
    Convênios: true,
  });

  const [clinics, setClinics] = useState<Clinic[]>([
    { 
      id: 1, 
      name: "Clínica Vida Saudável", 
      cnpj: "12.345.678/0001-90",
      email: "contato@vidasa.com",
      phone: "(11) 98765-4321",
      users: 24, 
      plan: "Profissional", 
      status: "active",
      subscriptionStart: "2023-06-15",
      lastPayment: "2024-01-15",
      nextPayment: "2024-02-15",
      monthlyValue: 890,
      address: "Rua das Flores, 123 - São Paulo, SP",
      enabledModules: getClinicEnabledModules(1),
    },
    { 
      id: 2, 
      name: "Centro Médico São Lucas", 
      cnpj: "98.765.432/0001-10",
      email: "contato@saolucas.com",
      phone: "(11) 91234-5678",
      users: 18, 
      plan: "Profissional", 
      status: "active",
      subscriptionStart: "2023-08-20",
      lastPayment: "2024-01-20",
      nextPayment: "2024-02-20",
      monthlyValue: 890,
      address: "Av. Paulista, 1000 - São Paulo, SP",
      enabledModules: getClinicEnabledModules(2),
    },
    { 
      id: 3, 
      name: "Odonto Excellence", 
      cnpj: "11.222.333/0001-44",
      email: "contato@odonto.com",
      phone: "(11) 99876-5432",
      users: 12, 
      plan: "Profissional", 
      status: "pending",
      subscriptionStart: "2024-01-10",
      lastPayment: null,
      nextPayment: "2024-02-10",
      monthlyValue: 890,
      address: "Rua Augusta, 500 - São Paulo, SP",
      enabledModules: getClinicEnabledModules(3),
    },
    { 
      id: 4, 
      name: "NutriCare", 
      cnpj: "55.666.777/0001-88",
      email: "contato@nutricare.com",
      phone: "(11) 98765-1234",
      users: 8, 
      plan: "Profissional", 
      status: "suspended",
      subscriptionStart: "2023-09-05",
      lastPayment: "2023-12-05",
      nextPayment: "2024-02-05",
      monthlyValue: 890,
      address: "Rua Consolação, 200 - São Paulo, SP",
      enabledModules: getClinicEnabledModules(4),
    },
  ]);

  const paymentHistory = [
    { id: "PAY-001", date: "2024-01-15", amount: 890, status: "paid", method: "Cartão" },
    { id: "PAY-002", date: "2023-12-15", amount: 890, status: "paid", method: "Cartão" },
    { id: "PAY-003", date: "2023-11-15", amount: 890, status: "paid", method: "PIX" },
    { id: "PAY-004", date: "2023-10-15", amount: 890, status: "paid", method: "Cartão" },
  ];


  const filteredClinics = useMemo(() => {
    return clinics.filter(clinic => {
      const matchesSearch = clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           clinic.cnpj.includes(searchTerm) ||
                           clinic.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || clinic.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [clinics, searchTerm, statusFilter]);

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    }
    return value;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    }
    return value;
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Nome da clínica é obrigatório");
      return false;
    }
    if (!formData.cnpj.trim() || formData.cnpj.replace(/\D/g, '').length !== 14) {
      toast.error("CNPJ inválido");
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error("Email inválido");
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error("Telefone é obrigatório");
      return false;
    }
    return true;
  };

  const handleAddClinic = () => {
    if (!validateForm()) return;

    const newClinicId = clinics.length + 1;
    const newClinic: Clinic = {
      id: newClinicId,
      name: formData.name,
      cnpj: formatCNPJ(formData.cnpj),
      email: formData.email,
      phone: formatPhone(formData.phone),
      users: 0,
      plan: formData.plan,
      status: "pending",
      subscriptionStart: new Date().toISOString().split('T')[0],
      lastPayment: null,
      nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      monthlyValue: 890,
      address: formData.address,
      enabledModules: enabledModules,
    };

    // Salvar módulos habilitados
    saveClinicEnabledModules(newClinicId, enabledModules);

    setClinics([...clinics, newClinic]);
    toast.success("Clínica cadastrada com sucesso!");
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEditClinic = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setFormData({
      name: clinic.name,
      cnpj: clinic.cnpj,
      email: clinic.email,
      phone: clinic.phone,
      plan: clinic.plan,
      userLimit: clinic.users.toString(),
      address: clinic.address || "",
    });
    // Carregar módulos habilitados da clínica
    const clinicModules = clinic.enabledModules || getClinicEnabledModules(clinic.id);
    setEnabledModules(clinicModules);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Verificar se há um clinicId no state da navegação para abrir o dialog automaticamente
  useEffect(() => {
    const state = location.state as { viewClinicId?: number } | null;
    if (state?.viewClinicId) {
      const clinicToView = clinics.find(c => c.id === state.viewClinicId);
      if (clinicToView) {
        handleEditClinic(clinicToView);
        // Limpar o state para evitar reabrir o dialog ao navegar novamente
        window.history.replaceState({}, document.title);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, clinics]);

  const handleUpdateClinic = () => {
    if (!validateForm() || !selectedClinic) return;

    const updatedClinics = clinics.map(clinic =>
      clinic.id === selectedClinic.id
        ? {
            ...clinic,
            name: formData.name,
            cnpj: formatCNPJ(formData.cnpj),
            email: formData.email,
            phone: formatPhone(formData.phone),
            plan: formData.plan,
            address: formData.address,
            enabledModules: enabledModules,
          }
        : clinic
    );

    // Salvar módulos habilitados
    saveClinicEnabledModules(selectedClinic.id, enabledModules);

    setClinics(updatedClinics);
    toast.success("Clínica atualizada com sucesso!");
    setIsDialogOpen(false);
    setIsEditMode(false);
    setSelectedClinic(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      cnpj: "",
      email: "",
      phone: "",
      plan: "Profissional",
      userLimit: "",
      address: "",
    });
    // Resetar módulos para padrão (todos habilitados)
    setEnabledModules({
      Dashboard: true,
      Agenda: true,
      Consulta: true,
      Pacientes: true,
      CRM: true,
      Financeiro: true,
      Pagamentos: true,
      Equipe: true,
      Estoque: true,
      Comunicação: true,
      Relatórios: true,
      Suporte: true,
      Configurações: true,
      Convênios: true,
    });
  };

  const handleSuspend = (clinic: Clinic) => {
    const updatedClinics = clinics.map(c =>
      c.id === clinic.id ? { ...c, status: "suspended" as const } : c
    );
    setClinics(updatedClinics);
    toast.success(`Clínica ${clinic.name} suspensa com sucesso!`);
  };

  const handleReactivate = (clinic: Clinic) => {
    const updatedClinics = clinics.map(c =>
      c.id === clinic.id ? { ...c, status: "active" as const } : c
    );
    setClinics(updatedClinics);
    toast.success(`Clínica ${clinic.name} reativada com sucesso!`);
  };

  const handleCancel = (clinic: Clinic) => {
    const updatedClinics = clinics.filter(c => c.id !== clinic.id);
    setClinics(updatedClinics);
    toast.success(`Assinatura da clínica ${clinic.name} cancelada!`);
  };

  const handleViewHistory = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setHistoryDialogOpen(true);
  };

  const handleExport = () => {
    toast.success("Exportando lista de clínicas...");
    // Simulação de exportação
    setTimeout(() => {
      toast.success("Dados exportados com sucesso!");
    }, 1000);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gerenciar Clínicas</h1>
            <p className="text-muted-foreground mt-1">Cadastro e controle de clínicas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setIsEditMode(false);
              setSelectedClinic(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Nova Clínica
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isEditMode ? "Editar Clínica" : "Cadastrar Nova Clínica"}</DialogTitle>
                <DialogDescription>Preencha os dados da clínica</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome da Clínica *</Label>
                    <Input 
                      placeholder="Nome completo" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CNPJ *</Label>
                    <Input 
                      placeholder="00.000.000/0000-00" 
                      value={formData.cnpj}
                      onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
                      maxLength={18}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input 
                      type="email" 
                      placeholder="contato@clinica.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone *</Label>
                    <Input 
                      placeholder="(00) 00000-0000" 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                      maxLength={15}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Endereço</Label>
                  <Textarea 
                    placeholder="Rua, número, bairro, cidade - UF"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Plano</Label>
                    <Select 
                      value={formData.plan}
                      onValueChange={(value) => setFormData({ ...formData, plan: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Profissional">Profissional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Limite de Usuários</Label>
                    <Input 
                      type="number" 
                      placeholder="Ilimitado" 
                      value={formData.userLimit}
                      onChange={(e) => setFormData({ ...formData, userLimit: e.target.value })}
                    />
                  </div>
                </div>

                {/* Seção de Módulos Habilitados */}
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label className="text-base font-semibold">Módulos Habilitados</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Selecione quais módulos estarão disponíveis para esta clínica
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(enabledModules).map(([module, enabled]) => (
                      <div key={module} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                        <Label htmlFor={`module-${module}`} className="text-sm font-medium cursor-pointer flex-1">
                          {module}
                        </Label>
                        <Switch
                          id={`module-${module}`}
                          checked={enabled}
                          onCheckedChange={(checked) => {
                            setEnabledModules(prev => ({
                              ...prev,
                              [module]: checked
                            }));
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => {
                    setIsDialogOpen(false);
                    setIsEditMode(false);
                    setSelectedClinic(null);
                    resetForm();
                  }} className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20">
                    Cancelar
                  </Button>
                  <Button onClick={isEditMode ? handleUpdateClinic : handleAddClinic} className="bg-primary hover:bg-primary/90">
                    {isEditMode ? "Salvar Alterações" : "Cadastrar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Clínicas</CardTitle>
              <CardDescription>
                {filteredClinics.length} clínica{filteredClinics.length !== 1 ? 's' : ''} encontrada{filteredClinics.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar clínica..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="suspended">Suspensas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Nome</TableHead>
                <TableHead className="font-semibold">CNPJ</TableHead>
                <TableHead className="font-semibold">Contato</TableHead>
                <TableHead className="font-semibold">Usuários</TableHead>
                <TableHead className="font-semibold">Plano</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Valor Mensal</TableHead>
                <TableHead className="font-semibold text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClinics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhuma clínica encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredClinics.map((clinic) => (
                  <TableRow key={clinic.id} className="hover:bg-muted/30 border-b">
                    <TableCell className="font-medium">{clinic.name}</TableCell>
                    <TableCell>{clinic.cnpj}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{clinic.email}</p>
                        <p className="text-muted-foreground">{clinic.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{clinic.users}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{clinic.plan}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          clinic.status === "active" 
                            ? "default" 
                            : clinic.status === "suspended"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {clinic.status === "active" ? "Ativa" : clinic.status === "suspended" ? "Suspensa" : "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">R$ {clinic.monthlyValue.toLocaleString('pt-BR')}</span>
                    </TableCell>
                    <TableCell className="text-right w-[140px]">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleViewHistory(clinic)}
                          className="h-8 w-8"
                          title="Histórico de Pagamentos"
                        >
                          <History className="h-4 w-4" />
                        </Button>
                        {clinic.status === "active" ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" title="Suspender">
                                <Pause className="h-4 w-4 text-orange-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Suspender Clínica</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja suspender a clínica {clinic.name}? A clínica não poderá acessar o sistema até ser reativada.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleSuspend(clinic)} className="bg-primary hover:bg-primary/90">
                                  Suspender
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : clinic.status === "suspended" ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" title="Reativar">
                                <Play className="h-4 w-4 text-green-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Reativar Clínica</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja reativar a clínica {clinic.name}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleReactivate(clinic)} className="bg-primary hover:bg-primary/90">
                                  Reativar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : null}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Cancelar Assinatura">
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancelar Assinatura</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja cancelar a assinatura da clínica {clinic.name}? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleCancel(clinic)} className="bg-primary hover:bg-primary/90">
                                Cancelar Assinatura
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          title="Editar"
                          onClick={() => handleEditClinic(clinic)}
                        >
                          <Edit className="h-4 w-4" />
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

      {/* Histórico de Pagamentos Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico de Pagamentos - {selectedClinic?.name}
            </DialogTitle>
            <DialogDescription>
              Histórico completo de transações e pagamentos
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="payments" className="w-full">
            <TabsList>
              <TabsTrigger value="payments">Pagamentos</TabsTrigger>
              <TabsTrigger value="subscription">Assinatura</TabsTrigger>
            </TabsList>
            <TabsContent value="payments" className="space-y-4">
              <div className="space-y-3">
                {paymentHistory.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <DollarSign className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{payment.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.date).toLocaleDateString('pt-BR')} • {payment.method}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">R$ {payment.amount.toLocaleString('pt-BR')}</p>
                      </div>
                      <Badge variant={payment.status === "paid" ? "default" : "secondary"}>
                        {payment.status === "paid" ? "Pago" : "Pendente"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="subscription" className="space-y-4">
              {selectedClinic && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações da Assinatura</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Plano:</span>
                        <Badge variant="outline">{selectedClinic.plan}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Início da Assinatura:</span>
                        <span className="font-medium">{new Date(selectedClinic.subscriptionStart).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Último Pagamento:</span>
                        <span className="font-medium">
                          {selectedClinic.lastPayment ? new Date(selectedClinic.lastPayment).toLocaleDateString('pt-BR') : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Próximo Pagamento:</span>
                        <span className="font-medium">{new Date(selectedClinic.nextPayment).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valor Mensal:</span>
                        <span className="font-bold text-primary">R$ {selectedClinic.monthlyValue.toLocaleString('pt-BR')}</span>
                      </div>
                      {selectedClinic.address && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Endereço:</span>
                          <span className="font-medium text-right max-w-[60%]">{selectedClinic.address}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminClinicas;

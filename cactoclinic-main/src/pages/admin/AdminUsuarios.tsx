import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, UserPlus, Shield, Mail, X, Activity, Eye, Edit, Trash2, Download, Filter, Ban, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { toast } from "sonner";

interface User {
  id: number;
  name: string;
  email: string;
  clinic: string;
  clinicId: number;
  role: string;
  status: "active" | "inactive" | "suspended";
  lastLogin: string;
  permissionLevel: string;
  createdAt: string;
  phone?: string;
}

interface ActivityLog {
  id: number;
  action: string;
  description: string;
  timestamp: string;
  ip: string;
}

const AdminUsuarios = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [clinicFilter, setClinicFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    clinic: "",
    role: "",
    permissionLevel: "",
    phone: "",
  });

  const [users, setUsers] = useState<User[]>([
    { 
      id: 1,
      name: "Dr. João Silva", 
      email: "joao@vidasa.com",
      phone: "(11) 98765-4321",
      clinic: "Clínica Vida Saudável",
      clinicId: 1,
      role: "Médico", 
      status: "active", 
      lastLogin: "Há 2 horas",
      permissionLevel: "medico",
      createdAt: "2023-06-15",
    },
    { 
      id: 2,
      name: "Dra. Maria Santos", 
      email: "maria@saolucas.com",
      phone: "(11) 91234-5678",
      clinic: "Centro Médico São Lucas",
      clinicId: 2,
      role: "Administrador", 
      status: "active", 
      lastLogin: "Há 5 horas",
      permissionLevel: "admin",
      createdAt: "2023-05-20",
    },
    { 
      id: 3,
      name: "Ana Costa", 
      email: "ana@odonto.com",
      phone: "(11) 99876-5432",
      clinic: "Odonto Excellence",
      clinicId: 3,
      role: "Recepcionista", 
      status: "active", 
      lastLogin: "Há 1 dia",
      permissionLevel: "recepcionista",
      createdAt: "2023-08-10",
    },
    { 
      id: 4,
      name: "Pedro Oliveira", 
      email: "pedro@nutricare.com",
      phone: "(11) 98765-1234",
      clinic: "NutriCare",
      clinicId: 4,
      role: "Nutricionista", 
      status: "inactive", 
      lastLogin: "Há 7 dias",
      permissionLevel: "medico",
      createdAt: "2023-09-05",
    },
    { 
      id: 5,
      name: "Julia Mendes", 
      email: "julia@estetica.com",
      phone: "(11) 97654-3210",
      clinic: "Estética Renovar",
      clinicId: 5,
      role: "Esteticista", 
      status: "active", 
      lastLogin: "Há 3 horas",
      permissionLevel: "medico",
      createdAt: "2023-10-12",
    },
  ]);

  const activityLogs: ActivityLog[] = [
    { id: 1, action: "Login", description: "Usuário fez login no sistema", timestamp: "2024-01-20 14:30:00", ip: "192.168.1.100" },
    { id: 2, action: "Consulta", description: "Criou nova consulta para paciente Maria Silva", timestamp: "2024-01-20 14:45:00", ip: "192.168.1.100" },
    { id: 3, action: "Prontuário", description: "Atualizou prontuário do paciente João Santos", timestamp: "2024-01-20 15:20:00", ip: "192.168.1.100" },
    { id: 4, action: "Logout", description: "Usuário fez logout do sistema", timestamp: "2024-01-20 16:00:00", ip: "192.168.1.100" },
    { id: 5, action: "Login", description: "Usuário fez login no sistema", timestamp: "2024-01-19 09:15:00", ip: "192.168.1.105" },
  ];

  const clinics = Array.from(new Set(users.map(u => u.clinic)));

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.clinic.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClinic = clinicFilter === "all" || user.clinic === clinicFilter;
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesClinic && matchesStatus && matchesRole;
    });
  }, [users, searchTerm, clinicFilter, statusFilter, roleFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.status === "active").length;
    const admins = users.filter(u => u.permissionLevel === "admin").length;
    const newUsers = users.filter(u => {
      const created = new Date(u.createdAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return created >= weekAgo;
    }).length;
    
    return { total, active, admins, newUsers };
  }, [users]);

  const handleViewLogs = (user: User) => {
    setSelectedUser(user);
    setLogsDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      clinic: user.clinic,
      role: user.role,
      permissionLevel: user.permissionLevel,
      phone: user.phone || "",
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleAddUser = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.clinic.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const newUser: User = {
      id: users.length + 1,
      name: formData.name,
      email: formData.email,
      clinic: formData.clinic,
      clinicId: clinics.indexOf(formData.clinic) + 1,
      role: formData.role,
      status: "active",
      lastLogin: "Nunca",
      permissionLevel: formData.permissionLevel,
      createdAt: new Date().toISOString().split('T')[0],
      phone: formData.phone,
    };

    setUsers([...users, newUser]);
    toast.success("Usuário adicionado com sucesso!");
    setIsDialogOpen(false);
    resetForm();
  };

  const handleUpdateUser = () => {
    if (!selectedUser || !formData.name.trim() || !formData.email.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const updatedUsers = users.map(user =>
      user.id === selectedUser.id
        ? {
            ...user,
            name: formData.name,
            email: formData.email,
            clinic: formData.clinic,
            role: formData.role,
            permissionLevel: formData.permissionLevel,
            phone: formData.phone,
          }
        : user
    );

    setUsers(updatedUsers);
    toast.success("Usuário atualizado com sucesso!");
    setIsDialogOpen(false);
    setIsEditMode(false);
    setSelectedUser(null);
    resetForm();
  };

  const handleDeleteUser = (user: User) => {
    const updatedUsers = users.filter(u => u.id !== user.id);
    setUsers(updatedUsers);
    toast.success(`Usuário ${user.name} removido com sucesso!`);
  };

  const handleToggleStatus = (user: User) => {
    const updatedUsers = users.map(u =>
      u.id === user.id
        ? { ...u, status: u.status === "active" ? "inactive" as const : "active" as const }
        : u
    );
    setUsers(updatedUsers);
    toast.success(`Status do usuário ${user.name} alterado!`);
  };

  const handleSuspendUser = (user: User) => {
    const updatedUsers = users.map(u =>
      u.id === user.id ? { ...u, status: "suspended" as const } : u
    );
    setUsers(updatedUsers);
    toast.success(`Usuário ${user.name} suspenso!`);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      clinic: "",
      role: "",
      permissionLevel: "",
      phone: "",
    });
  };

  const handleExport = () => {
    toast.success("Exportando lista de usuários...");
    setTimeout(() => {
      toast.success("Dados exportados com sucesso!");
    }, 1000);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestão de Usuários</h1>
            <p className="text-muted-foreground mt-1">
              Gerenciar usuários de todas as clínicas cadastradas
            </p>
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
              setSelectedUser(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <UserPlus className="mr-2 h-4 w-4" />
                Adicionar Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{isEditMode ? "Editar Usuário" : "Adicionar Novo Usuário"}</DialogTitle>
                <DialogDescription>
                  {isEditMode ? "Atualize as informações do usuário" : "Preencha os dados do novo usuário"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome Completo *</Label>
                    <Input
                      placeholder="Nome completo"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      placeholder="email@exemplo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      placeholder="(00) 00000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Clínica *</Label>
                    <Select
                      value={formData.clinic}
                      onValueChange={(value) => setFormData({ ...formData, clinic: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a clínica" />
                      </SelectTrigger>
                      <SelectContent>
                        {clinics.map((clinic) => (
                          <SelectItem key={clinic} value={clinic}>
                            {clinic}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Função *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => {
                        setFormData({ ...formData, role: value });
                        // Auto-set permission level based on role
                        if (value === "Administrador") {
                          setFormData(prev => ({ ...prev, permissionLevel: "admin" }));
                        } else if (value === "Médico" || value === "Nutricionista" || value === "Esteticista") {
                          setFormData(prev => ({ ...prev, permissionLevel: "medico" }));
                        } else if (value === "Recepcionista") {
                          setFormData(prev => ({ ...prev, permissionLevel: "recepcionista" }));
                        } else if (value === "Financeiro") {
                          setFormData(prev => ({ ...prev, permissionLevel: "financeiro" }));
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a função" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Administrador">Administrador</SelectItem>
                        <SelectItem value="Médico">Médico</SelectItem>
                        <SelectItem value="Recepcionista">Recepcionista</SelectItem>
                        <SelectItem value="Financeiro">Financeiro</SelectItem>
                        <SelectItem value="Nutricionista">Nutricionista</SelectItem>
                        <SelectItem value="Esteticista">Esteticista</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nível de Permissão *</Label>
                    <Select
                      value={formData.permissionLevel}
                      onValueChange={(value) => setFormData({ ...formData, permissionLevel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="medico">Médico</SelectItem>
                        <SelectItem value="recepcionista">Recepcionista</SelectItem>
                        <SelectItem value="financeiro">Financeiro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => {
                    setIsDialogOpen(false);
                    setIsEditMode(false);
                    setSelectedUser(null);
                    resetForm();
                  }}>
                    Cancelar
                  </Button>
                  <Button onClick={isEditMode ? handleUpdateUser : handleAddUser} className="bg-primary hover:bg-primary/90">
                    {isEditMode ? "Salvar Alterações" : "Adicionar Usuário"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Todos os usuários</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Usuários Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% taxa de ativação
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.admins}</div>
            <p className="text-xs text-muted-foreground mt-1">Usuários admin</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Novos (7 dias)</CardTitle>
            <UserPlus className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{stats.newUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Novos cadastros</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Todos os Usuários</CardTitle>
              <CardDescription>
                {filteredUsers.length} usuário{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={clinicFilter} onValueChange={setClinicFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Clínicas</SelectItem>
                  {clinics.map((clinic) => (
                    <SelectItem key={clinic} value={clinic}>
                      {clinic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Funções</SelectItem>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Médico">Médico</SelectItem>
                  <SelectItem value="Recepcionista">Recepcionista</SelectItem>
                  <SelectItem value="Financeiro">Financeiro</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                  <SelectItem value="suspended">Suspensos</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar usuário..." 
                  className="pl-10 pr-10 w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Usuário</TableHead>
                <TableHead className="font-semibold">Clínica</TableHead>
                <TableHead className="font-semibold">Função</TableHead>
                <TableHead className="font-semibold">Permissão</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Último Acesso</TableHead>
                <TableHead className="font-semibold text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/30 border-b">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                          {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.clinic}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.permissionLevel}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          user.status === "active" 
                            ? "default" 
                            : user.status === "suspended"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {user.status === "active" ? "Ativo" : user.status === "suspended" ? "Suspenso" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.lastLogin}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleViewLogs(user)}
                          className="h-8 w-8"
                          title="Ver Logs de Atividade"
                        >
                          <Activity className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleToggleStatus(user)}
                          className="h-8 w-8"
                          title={user.status === "active" ? "Desativar" : "Ativar"}
                        >
                          {user.status === "active" ? (
                            <Ban className="h-4 w-4 text-orange-600" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          title="Editar"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700" title="Excluir">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o usuário {user.name}? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteUser(user)} 
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Logs Dialog */}
      <Dialog open={logsDialogOpen} onOpenChange={setLogsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Logs de Atividade - {selectedUser?.name}
            </DialogTitle>
            <DialogDescription>
              Histórico completo de ações e acessos do usuário
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="activity" className="w-full">
            <TabsList>
              <TabsTrigger value="activity">Atividade</TabsTrigger>
              <TabsTrigger value="access">Acessos</TabsTrigger>
            </TabsList>
            <TabsContent value="activity" className="space-y-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium">{log.action}</p>
                          <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{log.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">IP: {log.ip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="access" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informações de Acesso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedUser && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Data de Criação:</span>
                        <span className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Último Login:</span>
                        <span className="font-medium">{selectedUser.lastLogin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nível de Permissão:</span>
                        <Badge variant="outline">{selectedUser.permissionLevel}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={selectedUser.status === "active" ? "default" : "secondary"}>
                          {selectedUser.status === "active" ? "Ativo" : selectedUser.status === "suspended" ? "Suspenso" : "Inativo"}
                        </Badge>
                      </div>
                      {selectedUser.phone && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Telefone:</span>
                          <span className="font-medium">{selectedUser.phone}</span>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsuarios;

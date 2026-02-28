import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, UserPlus, Shield, Mail, X, Activity, Eye, Edit, Trash2, Download, Filter, Ban, CheckCircle, Key } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface CactoAIUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "suspended";
  lastLogin: string;
  permissions: {
    dashboard: boolean;
    clinicas: boolean;
    usuarios: boolean;
    assinaturas: boolean;
    relatorios: boolean;
    suporte: boolean;
    permissoes: boolean;
    configuracoes: boolean;
    equipeCactoAI: boolean;
  };
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

const AdminEquipeCactoAI = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<CactoAIUser | null>(null);
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    phone: "",
    permissions: {
      dashboard: true,
      clinicas: false,
      usuarios: false,
      assinaturas: false,
      relatorios: false,
      suporte: false,
      permissoes: false,
      configuracoes: false,
      equipeCactoAI: false,
    },
  });

  const [users, setUsers] = useState<CactoAIUser[]>([
    { 
      id: 1,
      name: "Admin Master", 
      email: "admin@cactoai.com",
      phone: "(11) 98765-4321",
      role: "Super Admin", 
      status: "active", 
      lastLogin: "Há 2 horas",
      permissions: {
        dashboard: true,
        clinicas: true,
        usuarios: true,
        assinaturas: true,
        relatorios: true,
        suporte: true,
        permissoes: true,
        configuracoes: true,
        equipeCactoAI: true,
      },
      createdAt: "2023-01-15",
    },
    { 
      id: 2,
      name: "Suporte Técnico", 
      email: "suporte@cactoai.com",
      phone: "(11) 91234-5678",
      role: "Suporte", 
      status: "active", 
      lastLogin: "Há 5 horas",
      permissions: {
        dashboard: true,
        clinicas: false,
        usuarios: false,
        assinaturas: false,
        relatorios: false,
        suporte: true,
        permissoes: false,
        configuracoes: false,
        equipeCactoAI: false,
      },
      createdAt: "2023-05-20",
    },
    { 
      id: 3,
      name: "Analista de Dados", 
      email: "analista@cactoai.com",
      phone: "(11) 99876-5432",
      role: "Analista", 
      status: "active", 
      lastLogin: "Há 1 dia",
      permissions: {
        dashboard: true,
        clinicas: true,
        usuarios: false,
        assinaturas: true,
        relatorios: true,
        suporte: false,
        permissoes: false,
        configuracoes: false,
        equipeCactoAI: false,
      },
      createdAt: "2023-08-10",
    },
  ]);

  const activityLogs: ActivityLog[] = [
    { id: 1, action: "Login", description: "Usuário fez login no sistema admin", timestamp: "2024-01-20 14:30:00", ip: "192.168.1.100" },
    { id: 2, action: "Acesso", description: "Acessou gestão de clínicas", timestamp: "2024-01-20 14:45:00", ip: "192.168.1.100" },
    { id: 3, action: "Edição", description: "Editou configurações do sistema", timestamp: "2024-01-20 15:20:00", ip: "192.168.1.100" },
    { id: 4, action: "Logout", description: "Usuário fez logout do sistema", timestamp: "2024-01-20 16:00:00", ip: "192.168.1.100" },
  ];

  const roles = ["Super Admin", "Suporte", "Analista", "Desenvolvedor", "Gerente"];

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchTerm, statusFilter, roleFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.status === "active").length;
    const admins = users.filter(u => u.role === "Super Admin").length;
    const newUsers = users.filter(u => {
      const created = new Date(u.createdAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return created >= weekAgo;
    }).length;
    
    return { total, active, admins, newUsers };
  }, [users]);

  const handleViewLogs = (user: CactoAIUser) => {
    setSelectedUser(user);
    setLogsDialogOpen(true);
  };

  const handleEditUser = (user: CactoAIUser) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || "",
      permissions: user.permissions,
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleAddUser = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.role.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const newUser: CactoAIUser = {
      id: users.length + 1,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: "active",
      lastLogin: "Nunca",
      permissions: formData.permissions,
      createdAt: new Date().toISOString().split('T')[0],
      phone: formData.phone,
    };

    setUsers([...users, newUser]);
    toast.success("Usuário da equipe adicionado com sucesso!");
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
            role: formData.role,
            permissions: formData.permissions,
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

  const handleDeleteUser = (user: CactoAIUser) => {
    const updatedUsers = users.filter(u => u.id !== user.id);
    setUsers(updatedUsers);
    toast.success(`Usuário ${user.name} removido com sucesso!`);
  };

  const handleToggleStatus = (user: CactoAIUser) => {
    const updatedUsers = users.map(u =>
      u.id === user.id
        ? { ...u, status: u.status === "active" ? "inactive" as const : "active" as const }
        : u
    );
    setUsers(updatedUsers);
    toast.success(`Status do usuário ${user.name} alterado!`);
  };

  const handleTogglePermission = (permission: keyof CactoAIUser['permissions']) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [permission]: !formData.permissions[permission],
      },
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "",
      phone: "",
      permissions: {
        dashboard: true,
        clinicas: false,
        usuarios: false,
        assinaturas: false,
        relatorios: false,
        suporte: false,
        permissoes: false,
        configuracoes: false,
        equipeCactoAI: false,
      },
    });
  };

  const handleExport = () => {
    toast.success("Exportando lista de usuários da equipe...");
    setTimeout(() => {
      toast.success("Dados exportados com sucesso!");
    }, 1000);
  };

  const getPermissionCount = (user: CactoAIUser) => {
    return Object.values(user.permissions).filter(Boolean).length;
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Equipe CactoAI</h1>
            <p className="text-muted-foreground mt-1">
              Gerenciar usuários da equipe CactoAI com acesso ao painel admin
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
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
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isEditMode ? "Editar Usuário da Equipe" : "Adicionar Novo Usuário da Equipe"}</DialogTitle>
                <DialogDescription>
                  {isEditMode ? "Atualize as informações e permissões do usuário" : "Preencha os dados e defina as permissões do novo usuário"}
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
                      placeholder="email@cactoai.com"
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
                    <Label>Função *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a função" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t">
                  <Label className="text-base font-semibold">Permissões de Acesso</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm">Dashboard</Label>
                      </div>
                      <Switch
                        checked={formData.permissions.dashboard}
                        onCheckedChange={() => handleTogglePermission('dashboard')}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm">Clínicas</Label>
                      </div>
                      <Switch
                        checked={formData.permissions.clinicas}
                        onCheckedChange={() => handleTogglePermission('clinicas')}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm">Usuários</Label>
                      </div>
                      <Switch
                        checked={formData.permissions.usuarios}
                        onCheckedChange={() => handleTogglePermission('usuarios')}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm">Assinaturas</Label>
                      </div>
                      <Switch
                        checked={formData.permissions.assinaturas}
                        onCheckedChange={() => handleTogglePermission('assinaturas')}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm">Relatórios</Label>
                      </div>
                      <Switch
                        checked={formData.permissions.relatorios}
                        onCheckedChange={() => handleTogglePermission('relatorios')}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm">Suporte</Label>
                      </div>
                      <Switch
                        checked={formData.permissions.suporte}
                        onCheckedChange={() => handleTogglePermission('suporte')}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm">Permissões</Label>
                      </div>
                      <Switch
                        checked={formData.permissions.permissoes}
                        onCheckedChange={() => handleTogglePermission('permissoes')}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm">Configurações</Label>
                      </div>
                      <Switch
                        checked={formData.permissions.configuracoes}
                        onCheckedChange={() => handleTogglePermission('configuracoes')}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm">Equipe CactoAI</Label>
                      </div>
                      <Switch
                        checked={formData.permissions.equipeCactoAI}
                        onCheckedChange={() => handleTogglePermission('equipeCactoAI')}
                      />
                    </div>
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
            <p className="text-xs text-muted-foreground mt-1">Membros da equipe</p>
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
              {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% ativos
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Super Admins</CardTitle>
            <Shield className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.admins}</div>
            <p className="text-xs text-muted-foreground mt-1">Acesso total</p>
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
              <CardTitle>Usuários da Equipe CactoAI</CardTitle>
              <CardDescription>
                {filteredUsers.length} usuário{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Funções</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
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
                <TableHead className="font-semibold">Função</TableHead>
                <TableHead className="font-semibold">Permissões</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Último Acesso</TableHead>
                <TableHead className="font-semibold text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{getPermissionCount(user)} permissões</span>
                      </div>
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
              <TabsTrigger value="permissions">Permissões</TabsTrigger>
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
            <TabsContent value="permissions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Permissões Atuais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedUser && (
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(selectedUser.permissions).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
                          <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          {value ? (
                            <CheckCircle className="h-4 w-4 text-success" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
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

export default AdminEquipeCactoAI;


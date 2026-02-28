import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Shield, Users, Settings, FileText, Save, Plus, Trash2, Edit, CheckCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { saveRoles, getAllRoles } from "@/lib/permissionService";

interface Role {
  id: string;
  name: string;
  users: number;
  permissions: string[];
  color: string;
  description?: string;
  modulePermissions?: Record<string, ModulePermission>;
}

interface ModulePermission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

interface Permission {
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

const AdminPermissoes = () => {
  const modules = [
    "Dashboard",
    "Agenda",
    "Consulta",
    "Pacientes",
    "CRM",
    "Financeiro",
    "Pagamentos",
    "Equipe",
    "Estoque",
    "Comunicação",
    "Relatórios",
    "Suporte",
    "Configurações",
    "Convênios"
  ];

  // Carregar roles do serviço de permissões ao inicializar
  const [roles, setRoles] = useState<Role[]>(() => {
    const loadedRoles = getAllRoles();
    // Garantir que os roles carregados tenham todas as propriedades necessárias
    const normalizedRoles = loadedRoles.map(role => ({
      ...role,
      users: role.users || 0,
      permissions: role.permissions || [],
      color: role.color || "bg-gray-500/10 text-gray-600",
    }));
    // Se não houver roles salvas, usar os padrões
    if (normalizedRoles.length === 0) {
      return [
    {
      id: "admin",
      name: "Administrador",
      users: 12,
      permissions: ["Tudo"],
      color: "bg-red-500/10 text-red-600",
      description: "Acesso total ao sistema",
      modulePermissions: {
        Dashboard: { view: true, create: true, edit: true, delete: true },
        Agenda: { view: true, create: true, edit: true, delete: true },
        Consulta: { view: true, create: true, edit: true, delete: true },
        Pacientes: { view: true, create: true, edit: true, delete: true },
        CRM: { view: true, create: true, edit: true, delete: true },
        Financeiro: { view: true, create: true, edit: true, delete: true },
        Pagamentos: { view: true, create: true, edit: true, delete: true },
        Equipe: { view: true, create: true, edit: true, delete: true },
        Estoque: { view: true, create: true, edit: true, delete: true },
        Comunicação: { view: true, create: true, edit: true, delete: true },
        Relatórios: { view: true, create: true, edit: true, delete: true },
        Suporte: { view: true, create: true, edit: true, delete: true },
        Configurações: { view: true, create: true, edit: true, delete: true },
        Convênios: { view: true, create: true, edit: true, delete: true },
      },
    },
    {
      id: "medico",
      name: "Médico",
      users: 145,
      permissions: ["Consultas", "Pacientes", "Agenda", "Prontuário"],
      color: "bg-blue-500/10 text-blue-600",
      description: "Acesso a funcionalidades médicas",
      modulePermissions: {
        Dashboard: { view: true, create: false, edit: false, delete: false },
        Agenda: { view: true, create: true, edit: true, delete: false },
        Consulta: { view: true, create: true, edit: true, delete: false },
        Pacientes: { view: true, create: true, edit: true, delete: false },
        CRM: { view: true, create: false, edit: false, delete: false },
        Financeiro: { view: false, create: false, edit: false, delete: false },
        Pagamentos: { view: false, create: false, edit: false, delete: false },
        Equipe: { view: false, create: false, edit: false, delete: false },
        Estoque: { view: true, create: false, edit: false, delete: false },
        Comunicação: { view: true, create: true, edit: false, delete: false },
        Relatórios: { view: true, create: false, edit: false, delete: false },
        Suporte: { view: true, create: true, edit: false, delete: false },
        Configurações: { view: false, create: false, edit: false, delete: false },
        Convênios: { view: false, create: false, edit: false, delete: false },
      },
    },
    {
      id: "recepcionista",
      name: "Recepcionista",
      users: 89,
      permissions: ["Agendamentos", "Pacientes (leitura)", "Cadastros"],
      color: "bg-purple-500/10 text-purple-600",
      description: "Acesso a agendamentos e cadastros",
      modulePermissions: {
        Dashboard: { view: true, create: false, edit: false, delete: false },
        Agenda: { view: true, create: true, edit: true, delete: false },
        Consulta: { view: true, create: false, edit: false, delete: false },
        Pacientes: { view: true, create: true, edit: true, delete: false },
        CRM: { view: true, create: true, edit: false, delete: false },
        Financeiro: { view: false, create: false, edit: false, delete: false },
        Pagamentos: { view: false, create: false, edit: false, delete: false },
        Equipe: { view: false, create: false, edit: false, delete: false },
        Estoque: { view: true, create: false, edit: false, delete: false },
        Comunicação: { view: true, create: true, edit: false, delete: false },
        Relatórios: { view: false, create: false, edit: false, delete: false },
        Suporte: { view: true, create: true, edit: false, delete: false },
        Configurações: { view: false, create: false, edit: false, delete: false },
        Convênios: { view: false, create: false, edit: false, delete: false },
      },
    },
    {
      id: "financeiro",
      name: "Financeiro",
      users: 34,
      permissions: ["Financeiro", "Pagamentos", "Relatórios"],
      color: "bg-green-500/10 text-green-600",
      description: "Acesso a funcionalidades financeiras",
      modulePermissions: {
        Dashboard: { view: true, create: false, edit: false, delete: false },
        Agenda: { view: false, create: false, edit: false, delete: false },
        Consulta: { view: false, create: false, edit: false, delete: false },
        Pacientes: { view: true, create: false, edit: false, delete: false },
        CRM: { view: false, create: false, edit: false, delete: false },
        Financeiro: { view: true, create: true, edit: true, delete: true },
        Pagamentos: { view: true, create: true, edit: true, delete: true },
        Equipe: { view: false, create: false, edit: false, delete: false },
        Estoque: { view: false, create: false, edit: false, delete: false },
        Comunicação: { view: false, create: false, edit: false, delete: false },
        Relatórios: { view: true, create: true, edit: false, delete: false },
        Suporte: { view: false, create: false, edit: false, delete: false },
        Configurações: { view: false, create: false, edit: false, delete: false },
        Convênios: { view: true, create: true, edit: true, delete: true },
      },
    },
      ];
    }
    return normalizedRoles;
  });

  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<string>("admin");
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isEditRole, setIsEditRole] = useState(false);
  const [roleFormData, setRoleFormData] = useState({
    name: "",
    description: "",
  });
  const [deleteRoleDialogOpen, setDeleteRoleDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const currentRole = roles.find(r => r.id === selectedRoleForPermissions);
  const currentPermissions = currentRole?.modulePermissions || {};

  const handleTogglePermission = (module: string, permissionType: keyof ModulePermission) => {
    if (!currentRole) return;

    const updatedRoles = roles.map(role => {
      if (role.id === currentRole.id) {
        const updatedModulePermissions = {
          ...role.modulePermissions,
          [module]: {
            ...(role.modulePermissions?.[module] || { view: false, create: false, edit: false, delete: false }),
            [permissionType]: !(role.modulePermissions?.[module]?.[permissionType] || false),
          },
        };
        return {
          ...role,
          modulePermissions: updatedModulePermissions,
        };
      }
      return role;
    });

    setRoles(updatedRoles);
    toast.success(`Permissão ${permissionType} do módulo ${module} atualizada!`);
  };

  // Listener para atualizações de roles de outras abas (apenas para sincronização entre abas)
  useEffect(() => {
    const handleRolesUpdate = () => {
      const updatedRoles = getAllRoles();
      if (updatedRoles.length > 0) {
        // Normalizar os roles para garantir que tenham todas as propriedades necessárias
        const normalizedRoles = updatedRoles.map(role => ({
          ...role,
          users: role.users || 0,
          permissions: role.permissions || [],
          color: role.color || "bg-gray-500/10 text-gray-600",
        }));
        // Só atualizar se realmente houver mudanças (evitar loops infinitos)
        setRoles(prevRoles => {
          const prevStr = JSON.stringify(prevRoles);
          const newStr = JSON.stringify(normalizedRoles);
          if (prevStr !== newStr) {
            return normalizedRoles;
          }
          return prevRoles;
        });
      }
    };
    
    window.addEventListener('rolesUpdated', handleRolesUpdate);
    return () => window.removeEventListener('rolesUpdated', handleRolesUpdate);
  }, []);

  const handleSavePermissions = () => {
    // Salvar roles no serviço de permissões
    saveRoles(roles);
    toast.success("Permissões salvas com sucesso!");
  };

  const stats = useMemo(() => {
    const totalUsers = roles.reduce((sum, role) => sum + role.users, 0);
    const totalRoles = roles.length;
    const rolesWithPermissions = roles.filter(r => r.modulePermissions && Object.keys(r.modulePermissions).length > 0).length;
    return {
      totalUsers,
      totalRoles,
      rolesWithPermissions,
    };
  }, [roles]);

  const handleCreateRole = () => {
    if (!roleFormData.name.trim()) {
      toast.error("Nome da função é obrigatório");
      return;
    }

    const newRole: Role = {
      id: roleFormData.name.toLowerCase().replace(/\s+/g, '-'),
      name: roleFormData.name,
      users: 0,
      permissions: [],
      color: "bg-gray-500/10 text-gray-600",
      description: roleFormData.description,
      modulePermissions: modules.reduce((acc, module) => {
        acc[module] = { view: false, create: false, edit: false, delete: false };
        return acc;
      }, {} as Record<string, ModulePermission>),
    };

    setRoles([...roles, newRole]);
    setSelectedRoleForPermissions(newRole.id);
    toast.success(`Função ${roleFormData.name} criada com sucesso!`);
    setIsRoleDialogOpen(false);
    setRoleFormData({ name: "", description: "" });
  };

  const handleEditRole = (role: Role) => {
    setSelectedRoleForPermissions(role.id);
    setRoleFormData({
      name: role.name,
      description: role.description || "",
    });
    setIsEditRole(true);
    setIsRoleDialogOpen(true);
  };

  // Função para gerar tags de permissão baseadas nos modulePermissions
  const getPermissionTags = (role: Role | undefined): string[] => {
    if (!role || !role.modulePermissions) return [];
    
    const tags: string[] = [];
    Object.entries(role.modulePermissions).forEach(([module, perms]) => {
      if (perms.view || perms.create || perms.edit || perms.delete) {
        const permTypes: string[] = [];
        if (perms.view) permTypes.push("Visualizar");
        if (perms.create) permTypes.push("Criar");
        if (perms.edit) permTypes.push("Editar");
        if (perms.delete) permTypes.push("Excluir");
        
        if (permTypes.length === 4) {
          tags.push(`${module} (Tudo)`);
        } else {
          tags.push(`${module} (${permTypes.join(", ")})`);
        }
      }
    });
    
    return tags;
  };

  const handleUpdateRole = () => {
    if (!roleFormData.name.trim()) {
      toast.error("Nome da função é obrigatório");
      return;
    }

    const roleToUpdate = roles.find(r => r.id === selectedRoleForPermissions);
    if (!roleToUpdate) {
      toast.error("Função não encontrada");
      return;
    }

    const updated = roles.map(role =>
      role.id === roleToUpdate.id
        ? { ...role, name: roleFormData.name, description: roleFormData.description }
        : role
    );

    setRoles(updated);
    toast.success("Função atualizada com sucesso!");
    setIsRoleDialogOpen(false);
    setIsEditRole(false);
    setRoleFormData({ name: "", description: "" });
  };

  const handleDeleteRole = (role: Role) => {
    const updated = roles.filter(r => r.id !== role.id);
    setRoles(updated);
    toast.success(`${role.name} removida com sucesso!`);
    setDeleteRoleDialogOpen(false);
    setRoleToDelete(null);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gerenciar Permissões</h1>
            <p className="text-muted-foreground mt-1">
              Controle de acesso e permissões por função
            </p>
          </div>
        </div>
        <Dialog open={isRoleDialogOpen} onOpenChange={(open) => {
          setIsRoleDialogOpen(open);
          if (!open) {
            setIsEditRole(false);
            setRoleFormData({ name: "", description: "" });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Nova Função
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditRole ? "Editar Função" : "Criar Nova Função"}</DialogTitle>
              <DialogDescription>
                {isEditRole ? "Atualize as informações da função" : "Defina uma nova função de acesso"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome da Função *</Label>
                <Input
                  placeholder="Ex: Enfermeiro"
                  value={roleFormData.name}
                  onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  placeholder="Descreva as responsabilidades desta função..."
                  value={roleFormData.description}
                  onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                  rows={3}
                />
              </div>
              {isEditRole && currentRole && (
                <div className="space-y-2">
                  <Label>Permissões Configuradas</Label>
                  <div className="p-4 rounded-lg border bg-muted/30 max-h-[200px] overflow-y-auto">
                    {getPermissionTags(currentRole).length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {getPermissionTags(currentRole).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhuma permissão configurada</p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Para editar permissões, use a matriz de permissões abaixo
                  </p>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setIsRoleDialogOpen(false);
                  setIsEditRole(false);
                  setRoleFormData({ name: "", description: "" });
                }} className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20">
                  Cancelar
                </Button>
                <Button onClick={isEditRole ? handleUpdateRole : handleCreateRole} className="bg-primary hover:bg-primary/90">
                  {isEditRole ? "Salvar Alterações" : "Criar Função"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Roles Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {roles.map((role) => (
          <Card 
            key={role.id} 
            className={`hover:shadow-lg transition-shadow cursor-pointer border-l-4 ${
              selectedRoleForPermissions === role.id 
                ? 'border-l-primary bg-primary/5' 
                : 'border-l-transparent'
            }`}
            onClick={() => setSelectedRoleForPermissions(role.id)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{role.name}</CardTitle>
                <div className={`rounded-full p-2 ${role.color}`}>
                  <Shield className="h-4 w-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold">{role.users}</p>
                <p className="text-xs text-muted-foreground">usuários</p>
                {role.description && (
                  <p className="text-xs text-muted-foreground mt-2">{role.description}</p>
                )}
                <div className="flex flex-wrap gap-1 mt-3">
                  {role.permissions && role.permissions.length > 0 ? (
                    role.permissions.slice(0, 3).map((perm, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {perm}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Sem permissões
                    </Badge>
                  )}
                  {role.permissions && role.permissions.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{role.permissions.length - 3}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                    onClick={() => handleEditRole(role)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  {role.users === 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRoleToDelete(role);
                        setDeleteRoleDialogOpen(true);
                      }}
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Permissions Matrix */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Matriz de Permissões</CardTitle>
              <CardDescription>Configure as permissões por módulo para a função selecionada</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedRoleForPermissions} onValueChange={setSelectedRoleForPermissions}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleSavePermissions} className="bg-primary hover:bg-primary/90">
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {currentRole ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Módulo</TableHead>
                <TableHead className="text-center font-semibold">Visualizar</TableHead>
                <TableHead className="text-center font-semibold">Criar</TableHead>
                <TableHead className="text-center font-semibold">Editar</TableHead>
                <TableHead className="text-center font-semibold">Excluir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {modules.map((module) => {
                  const modulePerms = currentPermissions[module] || { view: false, create: false, edit: false, delete: false };
                  return (
                    <TableRow key={module} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{module}</TableCell>
                  <TableCell className="text-center">
                    <Switch 
                          checked={modulePerms.view} 
                          onCheckedChange={() => handleTogglePermission(module, "view")}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch 
                          checked={modulePerms.create} 
                          onCheckedChange={() => handleTogglePermission(module, "create")}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch 
                          checked={modulePerms.edit} 
                          onCheckedChange={() => handleTogglePermission(module, "edit")}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch 
                          checked={modulePerms.delete} 
                          onCheckedChange={() => handleTogglePermission(module, "delete")}
                    />
                  </TableCell>
                </TableRow>
                  );
                })}
            </TableBody>
          </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Selecione uma função para configurar as permissões
            </div>
          )}
        </CardContent>
      </Card>

      {/* AlertDialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteRoleDialogOpen} onOpenChange={setDeleteRoleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a função <strong>{roleToDelete?.name}</strong>? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRoleToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (roleToDelete) {
                  handleDeleteRole(roleToDelete);
                }
              }}
              className="bg-primary hover:bg-primary/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPermissoes;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Bell,
  Key,
  Camera,
  Save,
  X,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Clock,
  Monitor,
  Moon,
  Sun,
  Building2,
  Settings,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/hooks/useClinic";

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  photo: string;
  address: string;
  createdAt: string;
  lastLogin: string;
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
}

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  ip: string;
  location: string;
}

const AdminPerfil = () => {
  const navigate = useNavigate();
  const { profile: authProfile, loading: authLoading } = useAuth();
  const { clinic, loading: clinicLoading } = useClinic();

  // Estado do perfil
  const [profile, setProfile] = useState<AdminProfile>({
    id: "",
    name: "",
    email: "",
    phone: "",
    role: "Administrador",
    photo: "",
    address: "",
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    twoFactorEnabled: false,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
  });

  useEffect(() => {
    if (authProfile) {
      setProfile(prev => ({
        ...prev,
        id: authProfile.id,
        name: authProfile.full_name || "Admin Sistema",
        email: authProfile.email || "",
        role: authProfile.role || "Administrador",
      }));
      setFormData(prev => ({
        ...prev,
        name: authProfile.full_name || "Admin Sistema",
        email: authProfile.email || "",
      }));
    }
  }, [authProfile]);

  // Estados do formulário
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    address: profile.address,
  });

  // Estados de senha
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // Estados de notificações
  const [notifications, setNotifications] = useState({
    email: profile.emailNotifications,
    push: profile.pushNotifications,
    sms: profile.smsNotifications,
    twoFactor: profile.twoFactorEnabled,
  });

  // Estado de foto
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Histórico de atividades
  const [activities] = useState<ActivityLog[]>([
    {
      id: "1",
      action: "Login",
      description: "Login realizado com sucesso",
      timestamp: new Date().toISOString(),
      ip: "192.168.1.100",
      location: "São Paulo, SP",
    },
    {
      id: "2",
      action: "Edição",
      description: `Clínica '${clinic?.name || 'Vida Saudável'}' foi editada`,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      ip: "192.168.1.100",
      location: "São Paulo, SP",
    },
    {
      id: "3",
      action: "Criação",
      description: "Novo usuário criado: João Silva",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      ip: "192.168.1.100",
      location: "São Paulo, SP",
    },
    {
      id: "4",
      action: "Exclusão",
      description: "Ticket de suporte #TKT-001 foi fechado",
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      ip: "192.168.1.100",
      location: "São Paulo, SP",
    },
  ]);

  // Carregar perfil do localStorage ou usar padrão
  useEffect(() => {
    const savedProfile = localStorage.getItem("adminProfile");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed);
        setFormData({
          name: parsed.name,
          email: parsed.email,
          phone: parsed.phone || "",
          address: parsed.address || "",
        });
        setNotifications({
          email: parsed.emailNotifications ?? true,
          push: parsed.pushNotifications ?? true,
          sms: parsed.smsNotifications ?? false,
          twoFactor: parsed.twoFactorEnabled ?? false,
        });
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      }
    }
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        setPhotoFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    const updatedProfile = {
      ...profile,
      ...formData,
      photo: photoPreview || profile.photo,
    };

    setProfile(updatedProfile);
    localStorage.setItem("adminProfile", JSON.stringify(updatedProfile));

    if (photoFile) {
      // Em produção, aqui faria upload da foto
      toast.success("Foto atualizada com sucesso!");
    }

    toast.success("Perfil atualizado com sucesso!");
  };

  const handleChangePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("A senha deve ter no mínimo 8 caracteres");
      return;
    }

    // Em produção, aqui faria validação da senha atual e atualização
    toast.success("Senha alterada com sucesso!");
    setPasswordDialogOpen(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleSaveNotifications = () => {
    const updatedProfile = {
      ...profile,
      emailNotifications: notifications.email,
      pushNotifications: notifications.push,
      smsNotifications: notifications.sms,
      twoFactorEnabled: notifications.twoFactor,
    };

    setProfile(updatedProfile);
    localStorage.setItem("adminProfile", JSON.stringify(updatedProfile));
    toast.success("Preferências de notificação salvas!");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCircle className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie suas informações pessoais e preferências
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="clinica">Clínica</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="atividades">Atividades</TabsTrigger>
        </TabsList>

        {/* Aba Perfil */}
        <TabsContent value="perfil" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais e foto de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Foto de Perfil */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={photoPreview || profile.photo} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                      {getInitials(formData.name)}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="photo-upload"
                    className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </label>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1">{formData.name}</p>
                  <p className="text-xs text-muted-foreground mb-2">{profile.role}</p>
                  <p className="text-xs text-muted-foreground">
                    Membro desde {new Date(profile.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Formulário */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seu@email.com"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Localização</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Cidade, Estado"
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      name: profile.name,
                      email: profile.email,
                      phone: profile.phone,
                      address: profile.address,
                    });
                    setPhotoPreview(null);
                    setPhotoFile(null);
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSaveProfile} className="bg-primary hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Informações da Conta */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Conta</CardTitle>
              <CardDescription>Detalhes sobre sua conta administrativa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Função</p>
                    <p className="text-xs text-muted-foreground">{profile.role}</p>
                  </div>
                </div>
                <Badge variant="default">{profile.role}</Badge>
              </div>

              <Separator />

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Último Acesso</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(profile.lastLogin).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  Ativo
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Clínica */}
        <TabsContent value="clinica" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>Minha Clínica</CardTitle>
                  <CardDescription>
                    Informações da clínica associada ao seu perfil
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {clinicLoading ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Carregando dados da clínica...</p>
                </div>
              ) : clinic ? (
                <>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Nome da Clínica</Label>
                      <p className="font-semibold text-lg">{clinic.name}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">CNPJ</Label>
                      <p className="font-medium">{clinic.cnpj || "Não informado"}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">E-mail de Contato</Label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{clinic.email || "Não informado"}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Telefone</Label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{clinic.phone || "Não informado"}</p>
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <Label className="text-muted-foreground">Endereço</Label>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <p className="font-medium">{clinic.address || "Não informado"}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Status da Clínica</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant={clinic.status === 'active' ? 'default' : 'secondary'}>
                          {clinic.status === 'active' ? 'Ativa' : clinic.status || 'Ativa'}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-1 text-right">
                      <Label className="text-muted-foreground">Plano Atual</Label>
                      <p className="font-bold text-primary">{clinic.plan || "Premium"}</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => navigate("/admin/clinicas")} variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Gerenciar Clínica
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <div className="p-4 rounded-full bg-muted">
                    <Building2 className="h-12 w-12 text-muted-foreground opacity-20" />
                  </div>
                  <div className="max-w-xs">
                    <h3 className="font-semibold text-lg">Nenhuma clínica encontrada</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Seu perfil não possui uma clínica vinculada ou você não é proprietário de nenhuma unidade.
                    </p>
                  </div>
                  <Button onClick={() => navigate("/admin/clinicas")} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Nova Clínica
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Segurança */}
        <TabsContent value="seguranca" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>
                Mantenha sua conta segura com uma senha forte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    placeholder="Digite sua senha atual"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    placeholder="Digite sua nova senha (mín. 8 caracteres)"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    placeholder="Confirme sua nova senha"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleChangePassword} className="bg-primary hover:bg-primary/90">
                  <Key className="h-4 w-4 mr-2" />
                  Alterar Senha
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Autenticação de Dois Fatores</CardTitle>
              <CardDescription>
                Adicione uma camada extra de segurança à sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">Autenticação de Dois Fatores (2FA)</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Requer um código adicional além da senha para fazer login
                  </p>
                </div>
                <Switch
                  checked={notifications.twoFactor}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, twoFactor: checked })
                  }
                />
              </div>

              {notifications.twoFactor && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">2FA Ativado</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Você precisará fornecer um código de autenticação ao fazer login
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications} className="bg-primary hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Notificações */}
        <TabsContent value="notificacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>
                Escolha como e quando você deseja ser notificado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <p className="font-medium text-sm">Notificações por E-mail</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Receba notificações importantes por e-mail
                  </p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <p className="font-medium text-sm">Notificações Push</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Receba notificações em tempo real no navegador
                  </p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, push: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <p className="font-medium text-sm">Notificações por SMS</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Receba alertas importantes por SMS
                  </p>
                </div>
                <Switch
                  checked={notifications.sms}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, sms: checked })
                  }
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveNotifications} className="bg-primary hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Preferências
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Atividades */}
        <TabsContent value="atividades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Atividades</CardTitle>
              <CardDescription>
                Registro de todas as ações realizadas na sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ação</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead>Localização</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activities.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhuma atividade registrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      activities.map((activity) => (
                        <TableRow key={activity.id}>
                          <TableCell>
                            <Badge
                              variant={
                                activity.action === "Login"
                                  ? "default"
                                  : activity.action === "Edição"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {activity.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-md">{activity.description}</TableCell>
                          <TableCell>
                            {new Date(activity.timestamp).toLocaleString("pt-BR")}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{activity.ip}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {activity.location}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPerfil;


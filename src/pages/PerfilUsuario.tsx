import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Camera,
  Save,
  X,
  Shield,
  Briefcase
} from "lucide-react";
import { toast } from "sonner";
import { useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

const PerfilUsuario = () => {
  const { profile, loading: authLoading } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Dados do usuário atual
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Médico",
    specialty: "",
    crm: "",
    birthDate: "",
    address: "",
    permissionLevel: "Médico",
    photo: "",
  });

  useEffect(() => {
    if (profile) {
      setUserData({
        name: profile.full_name || "",
        email: profile.email || "",
        phone: "", // Adicionar se existir na tabela profiles
        role: profile.role || "Médico",
        specialty: "",
        crm: "",
        birthDate: "",
        address: "",
        permissionLevel: profile.role || "Médico",
        photo: "",
      });
    }
  }, [profile]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 5MB");
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    toast.success("Perfil atualizado com sucesso!");
    setEditMode(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "médico":
      case "medico":
        return "bg-blue-500/10 text-blue-600";
      case "administrador":
      case "admin":
        return "bg-purple-500/10 text-purple-600";
      case "recepcionista":
        return "bg-green-500/10 text-green-600";
      case "financeiro":
        return "bg-orange-500/10 text-orange-600";
      default:
        return "bg-gray-500/10 text-gray-600";
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-baseline gap-3">
          <User className="h-8 w-8 text-primary shrink-0 mt-1" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Meu Perfil</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Gerencie suas informações pessoais
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(true)}>
              Editar Perfil
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Coluna Esquerda - Foto e Informações Básicas */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Foto do Perfil</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32 border-2 border-primary/20">
                <AvatarImage src={photo || userData.photo} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {userData.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              {editMode && (
                <div className="flex gap-2">
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Alterar Foto
                  </Button>
                  {photo && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPhoto(null);
                        setPhotoFile(null);
                        if (photoInputRef.current) {
                          photoInputRef.current.value = '';
                        }
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remover
                    </Button>
                  )}
                </div>
              )}
              <div className="text-center w-full">
                <p className="font-semibold text-lg">{userData.name}</p>
                <Badge className={`mt-2 ${getRoleBadgeColor(userData.role)}`}>
                  {userData.role}
                </Badge>
                {userData.specialty && (
                  <p className="text-sm text-muted-foreground mt-2">{userData.specialty}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informações de Acesso */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Permissões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Nível de Acesso</span>
                  </div>
                  <Badge variant="outline">{userData.permissionLevel}</Badge>
                </div>
                {userData.crm && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm font-medium">Registro Profissional</span>
                    <span className="text-sm text-muted-foreground">{userData.crm}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita - Formulário */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais e de contato
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nome Completo
                  </Label>
                  <Input
                    id="name"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    disabled={!editMode}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    disabled={!editMode}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    value={userData.phone}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                    disabled={!editMode}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="birthDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data de Nascimento
                  </Label>
                  <Input
                    id="birthDate"
                    value={userData.birthDate}
                    onChange={(e) => setUserData({ ...userData, birthDate: e.target.value })}
                    disabled={!editMode}
                  />
                </div>

                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Endereço
                  </Label>
                  <Input
                    id="address"
                    value={userData.address}
                    onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                    disabled={!editMode}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="role">Função</Label>
                  <Input
                    id="role"
                    value={userData.role}
                    disabled
                    className="bg-muted"
                  />
                </div>

                {userData.specialty && (
                  <div className="grid gap-2">
                    <Label htmlFor="specialty">Especialidade</Label>
                    <Input
                      id="specialty"
                      value={userData.specialty}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PerfilUsuario;


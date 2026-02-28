import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Mail, Bell, Database, Shield, CreditCard, FileText, Plus, Trash2, Edit, CheckCircle, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { toast } from "sonner";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
}

interface PaymentGateway {
  id: string;
  name: string;
  type: "primary" | "secondary";
  publicKey?: string;
  secretKey?: string;
}

const AdminConfiguracoes = () => {
  const [generalSettings, setGeneralSettings] = useState({
    systemName: "CactoSaude",
    systemUrl: "https://CactoSaude.com",
    supportEmail: "suporte@CactoSaude.com",
    maintenanceMode: false,
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpServer: "smtp.gmail.com",
    smtpPort: "587",
    senderEmail: "noreply@CactoSaude.com",
    smtpUser: "",
    smtpPassword: "",
    useSSL: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    googleLogin: false,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
  });

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupTime: "02:00",
    retentionDays: 30,
    lastBackup: "15/01/2024 às 02:00",
  });

  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([
    {
      id: "stripe",
      name: "Stripe",
      type: "primary",
      publicKey: "pk_live_...",
      secretKey: "sk_live_...",
    },
    {
      id: "asaas",
      name: "Asaas",
      type: "secondary",
    },
  ]);

  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([
    {
      id: "welcome",
      name: "Boas-vindas",
      subject: "Bem-vindo ao CactoSaude!",
      content: "Olá {{nome}},\n\nBem-vindo ao CactoSaude! Estamos felizes em tê-lo conosco.",
    },
    {
      id: "password-reset",
      name: "Recuperação de Senha",
      subject: "Recuperação de Senha - CactoSaude",
      content: "Olá,\n\nVocê solicitou a recuperação de senha. Clique no link abaixo para redefinir sua senha:\n{{link}}",
    },
    {
      id: "payment-notification",
      name: "Notificação de Pagamento",
      subject: "Pagamento Recebido - CactoSaude",
      content: "Olá {{nome}},\n\nSeu pagamento de R$ {{valor}} foi recebido com sucesso!",
    },
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [isEditTemplate, setIsEditTemplate] = useState(false);
  const [templateFormData, setTemplateFormData] = useState({
    name: "",
    subject: "",
    content: "",
  });
  const [deleteTemplateDialogOpen, setDeleteTemplateDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);

  const [primaryGateway, setPrimaryGateway] = useState("stripe");
  const [sandboxMode, setSandboxMode] = useState(false);

  const handleSaveGeneral = () => {
    toast.success("Configurações gerais salvas com sucesso!");
  };

  const handleSaveEmail = () => {
    if (!emailSettings.smtpServer || !emailSettings.senderEmail) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    toast.success("Configurações de email salvas com sucesso!");
  };

  const handleTestEmailConnection = () => {
    toast.info("Testando conexão SMTP...");
    setTimeout(() => {
      toast.success("Conexão SMTP testada com sucesso!");
    }, 2000);
  };

  const handleSavePayment = () => {
    toast.success("Configurações de pagamento salvas com sucesso!");
  };

  const handleTestPaymentConnection = () => {
    toast.info("Testando conexão com gateway...");
    setTimeout(() => {
      toast.success("Conexão testada com sucesso!");
    }, 2000);
  };

  const handleSaveSecurity = () => {
    toast.success("Configurações de segurança salvas com sucesso!");
  };

  const handleSaveBackup = () => {
    toast.success("Configurações de backup salvas com sucesso!");
  };

  const handleBackupNow = () => {
    toast.info("Iniciando backup...");
    setTimeout(() => {
      toast.success("Backup realizado com sucesso!");
      setBackupSettings(prev => ({
        ...prev,
        lastBackup: new Date().toLocaleString('pt-BR'),
      }));
    }, 3000);
  };

  const handleViewTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setTemplateDialogOpen(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setTemplateFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
    });
    setSelectedTemplate(template);
    setIsEditTemplate(true);
    setTemplateDialogOpen(true);
  };

  const handleSaveTemplate = () => {
    if (!templateFormData.name.trim() || !templateFormData.subject.trim() || !templateFormData.content.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (isEditTemplate && selectedTemplate) {
      const updated = emailTemplates.map(t =>
        t.id === selectedTemplate.id
          ? { ...t, ...templateFormData }
          : t
      );
      setEmailTemplates(updated);
      toast.success("Template atualizado com sucesso!");
    } else {
      const newTemplate: EmailTemplate = {
        id: templateFormData.name.toLowerCase().replace(/\s+/g, '-'),
        ...templateFormData,
      };
      setEmailTemplates([...emailTemplates, newTemplate]);
      toast.success("Template criado com sucesso!");
    }

    setTemplateDialogOpen(false);
    setIsEditTemplate(false);
    setSelectedTemplate(null);
    setTemplateFormData({ name: "", subject: "", content: "" });
  };

  const handleDeleteTemplate = (template: EmailTemplate) => {
    const updated = emailTemplates.filter(t => t.id !== template.id);
    setEmailTemplates(updated);
    toast.success(`${template.name} removido com sucesso!`);
    setDeleteTemplateDialogOpen(false);
    setTemplateToDelete(null);
  };

  const handleAddGateway = () => {
    toast.info("Funcionalidade de adicionar gateway em desenvolvimento");
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações Admin</h1>
          <p className="text-muted-foreground mt-1">
            Configurações globais do sistema
          </p>
        </div>
      </div>

      <Tabs defaultValue="geral" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="pagamento">Pagamento</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>Configurações básicas do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Nome do Sistema</Label>
                  <Input 
                    value={generalSettings.systemName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, systemName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL do Sistema</Label>
                  <Input 
                    value={generalSettings.systemUrl}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, systemUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email de Suporte</Label>
                  <Input 
                    type="email"
                    value={generalSettings.supportEmail}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo de Manutenção</Label>
                    <p className="text-sm text-muted-foreground">
                      Ativar para bloquear acesso ao sistema
                    </p>
                  </div>
                  <Switch 
                    checked={generalSettings.maintenanceMode}
                    onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, maintenanceMode: checked })}
                  />
                </div>
              </div>
              <Button onClick={handleSaveGeneral}>Salvar Alterações</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pagamento" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Integrações de Pagamento
              </CardTitle>
              <CardDescription>Configure os gateways de pagamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Gateway Principal</Label>
                  <Select value={primaryGateway} onValueChange={setPrimaryGateway}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="asaas">Asaas</SelectItem>
                      <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                      <SelectItem value="pagarme">Pagarme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {paymentGateways.find(g => g.id === primaryGateway && g.type === "primary") && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Chave Pública</Label>
                        <Input type="password" placeholder="pk_live_..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Chave Secreta</Label>
                        <Input type="password" placeholder="sk_live_..." />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Modo Sandbox</Label>
                        <p className="text-sm text-muted-foreground">
                          Use ambiente de testes
                        </p>
                      </div>
                      <Switch 
                        checked={sandboxMode}
                        onCheckedChange={setSandboxMode}
                      />
                    </div>
                  </>
                )}
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-3">Gateways Adicionais</p>
                  <div className="space-y-2">
                    {paymentGateways.filter(g => g.type === "secondary").map((gateway) => (
                      <div key={gateway.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          <span>{gateway.name}</span>
                          <Badge variant="secondary">Secundário</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" onClick={handleAddGateway}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Gateway
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleTestPaymentConnection}>Testar Conexão</Button>
                <Button onClick={handleSavePayment}>Salvar Configurações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Configurações de Email
              </CardTitle>
              <CardDescription>Configure o servidor SMTP</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Servidor SMTP *</Label>
                    <Input 
                      placeholder="smtp.gmail.com"
                      value={emailSettings.smtpServer}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpServer: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Porta *</Label>
                    <Input 
                      placeholder="587"
                      value={emailSettings.smtpPort}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email do Remetente *</Label>
                  <Input 
                    placeholder="noreply@CactoSaude.com"
                    value={emailSettings.senderEmail}
                    onChange={(e) => setEmailSettings({ ...emailSettings, senderEmail: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Usuário SMTP</Label>
                    <Input 
                      placeholder="usuario@gmail.com"
                      value={emailSettings.smtpUser}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Senha SMTP</Label>
                    <Input 
                      type="password" 
                      placeholder="••••••••"
                      value={emailSettings.smtpPassword}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Usar SSL/TLS</Label>
                    <p className="text-sm text-muted-foreground">
                      Conexão segura com o servidor
                    </p>
                  </div>
                  <Switch 
                    checked={emailSettings.useSSL}
                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, useSSL: checked })}
                  />
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-3">Templates de Email</p>
                  <div className="space-y-2">
                    {emailTemplates.map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>{template.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewTemplate(template)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Visualizar
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditTemplate(template)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setTemplateToDelete(template);
                              setDeleteTemplateDialogOpen(true);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setIsEditTemplate(false);
                        setSelectedTemplate(null);
                        setTemplateFormData({ name: "", subject: "", content: "" });
                        setTemplateDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Novo Template
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleTestEmailConnection}>Testar Conexão</Button>
                <Button onClick={handleSaveEmail}>Salvar Configurações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
              <CardDescription>Políticas de segurança do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Autenticação de Dois Fatores</Label>
                    <p className="text-sm text-muted-foreground">
                      Obrigatório para todos os usuários admin
                    </p>
                  </div>
                  <Switch 
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Login com Google</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir login via conta Google
                    </p>
                  </div>
                  <Switch 
                    checked={securitySettings.googleLogin}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, googleLogin: checked })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tempo de Sessão (minutos)</Label>
                  <Input 
                    type="number" 
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) || 60 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tentativas de Login</Label>
                  <Input 
                    type="number" 
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(e.target.value) || 5 })}
                  />
                  <p className="text-sm text-muted-foreground">
                    Número máximo de tentativas antes de bloquear
                  </p>
                </div>
              </div>
              <Button onClick={handleSaveSecurity}>Salvar Configurações</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backup e Recuperação
              </CardTitle>
              <CardDescription>Configurar backups automáticos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Backup Automático</Label>
                    <p className="text-sm text-muted-foreground">
                      Realizar backups diários automaticamente
                    </p>
                  </div>
                  <Switch 
                    checked={backupSettings.autoBackup}
                    onCheckedChange={(checked) => setBackupSettings({ ...backupSettings, autoBackup: checked })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Horário do Backup</Label>
                  <Input 
                    type="time" 
                    value={backupSettings.backupTime}
                    onChange={(e) => setBackupSettings({ ...backupSettings, backupTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Retenção (dias)</Label>
                  <Input 
                    type="number" 
                    value={backupSettings.retentionDays}
                    onChange={(e) => setBackupSettings({ ...backupSettings, retentionDays: parseInt(e.target.value) || 30 })}
                  />
                  <p className="text-sm text-muted-foreground">
                    Por quantos dias manter os backups
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-3">Último backup realizado</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-muted-foreground">{backupSettings.lastBackup}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleBackupNow}>Fazer Backup Agora</Button>
                <Button onClick={handleSaveBackup}>Salvar Configurações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Email Template Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={(open) => {
        setTemplateDialogOpen(open);
        if (!open) {
          setIsEditTemplate(false);
          setSelectedTemplate(null);
          setTemplateFormData({ name: "", subject: "", content: "" });
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditTemplate ? "Editar Template" : selectedTemplate ? "Visualizar Template" : "Criar Novo Template"}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate && !isEditTemplate 
                ? "Visualize o conteúdo do template"
                : "Configure o template de email"}
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && !isEditTemplate ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <p className="text-sm font-medium">{selectedTemplate.name}</p>
              </div>
              <div className="space-y-2">
                <Label>Assunto</Label>
                <p className="text-sm">{selectedTemplate.subject}</p>
              </div>
              <div className="space-y-2">
                <Label>Conteúdo</Label>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm whitespace-pre-wrap">{selectedTemplate.content}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
                  Fechar
                </Button>
                <Button onClick={() => handleEditTemplate(selectedTemplate)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Template *</Label>
                <Input
                  placeholder="Ex: Notificação de Consulta"
                  value={templateFormData.name}
                  onChange={(e) => setTemplateFormData({ ...templateFormData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Assunto do Email *</Label>
                <Input
                  placeholder="Ex: Nova consulta agendada"
                  value={templateFormData.subject}
                  onChange={(e) => setTemplateFormData({ ...templateFormData, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Conteúdo do Email *</Label>
                <Textarea
                  placeholder="Digite o conteúdo do email. Use {{variavel}} para variáveis dinâmicas."
                  value={templateFormData.content}
                  onChange={(e) => setTemplateFormData({ ...templateFormData, content: e.target.value })}
                  rows={10}
                />
                <p className="text-xs text-muted-foreground">
                  Variáveis disponíveis: {"{{nome}}"}, {"{{email}}"}, {"{{valor}}"}, {"{{link}}"}
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setTemplateDialogOpen(false);
                  setIsEditTemplate(false);
                  setSelectedTemplate(null);
                  setTemplateFormData({ name: "", subject: "", content: "" });
                }}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveTemplate}>
                  {isEditTemplate ? "Salvar Alterações" : "Criar Template"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AlertDialog de Confirmação de Exclusão de Template */}
      <AlertDialog open={deleteTemplateDialogOpen} onOpenChange={setDeleteTemplateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o template <strong>{templateToDelete?.name}</strong>? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTemplateToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (templateToDelete) {
                  handleDeleteTemplate(templateToDelete);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminConfiguracoes;

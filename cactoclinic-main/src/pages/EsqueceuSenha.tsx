import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import cactoIcon from "@/assets/cacto-icon.png";

const EsqueceuSenha = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "code" | "password" | "success">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulação de envio de código
    setTimeout(() => {
      if (email) {
        toast.success("Código de recuperação enviado para seu email!");
        setStep("code");
      } else {
        toast.error("Email é obrigatório");
      }
      setLoading(false);
    }, 1000);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulação de verificação de código
    setTimeout(() => {
      if (code && code.length === 6) {
        toast.success("Código verificado com sucesso!");
        setStep("password");
      } else {
        toast.error("Código inválido. Digite o código de 6 dígitos.");
      }
      setLoading(false);
    }, 1000);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validações
    if (!password || !confirmPassword) {
      toast.error("Preencha todos os campos");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      setLoading(false);
      return;
    }

    // Simulação de redefinição de senha
    setTimeout(() => {
      toast.success("Senha redefinida com sucesso!");
      setStep("success");
      setLoading(false);
    }, 1000);
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 flex items-center justify-center">
            <img src={cactoIcon} alt="CactoSaude" className="w-16 h-16 object-contain" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Recuperar Senha</CardTitle>
          <CardDescription className="text-base">
            {step === "email" && "Digite seu email para receber o código de recuperação"}
            {step === "code" && "Digite o código enviado para seu email"}
            {step === "password" && "Digite sua nova senha"}
            {step === "success" && "Sua senha foi redefinida com sucesso!"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "email" && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar Código"}
              </Button>
              <div className="text-center">
                <Link to="/login">
                  <Button variant="link" className="text-sm" type="button">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para o login
                  </Button>
                </Link>
              </div>
            </form>
          )}

          {step === "code" && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código de Verificação</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setCode(value);
                  }}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                  required
                />
                <p className="text-xs text-muted-foreground text-center">
                  Digite o código de 6 dígitos enviado para {email}
                </p>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || code.length !== 6}
              >
                {loading ? "Verificando..." : "Verificar Código"}
              </Button>
              <div className="text-center space-y-2">
                <Button
                  variant="link"
                  className="text-sm"
                  type="button"
                  onClick={() => {
                    setCode("");
                    setStep("email");
                  }}
                >
                  Reenviar código
                </Button>
                <div>
                  <Link to="/login">
                    <Button variant="link" className="text-sm" type="button">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Voltar para o login
                    </Button>
                  </Link>
                </div>
              </div>
            </form>
          )}

          {step === "password" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Mínimo de 6 caracteres
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Redefinindo..." : "Redefinir Senha"}
              </Button>
              <div className="text-center">
                <Button
                  variant="link"
                  className="text-sm"
                  type="button"
                  onClick={() => {
                    setCode("");
                    setStep("code");
                  }}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              </div>
            </form>
          )}

          {step === "success" && (
            <div className="space-y-4 text-center">
              <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Senha Redefinida!</h3>
                <p className="text-sm text-muted-foreground">
                  Sua senha foi redefinida com sucesso. Você já pode fazer login com sua nova senha.
                </p>
              </div>
              <Button
                onClick={handleBackToLogin}
                className="w-full"
              >
                Ir para o Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EsqueceuSenha;


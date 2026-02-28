import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import cactoIcon from "@/assets/cacto-icon.png";
import { setCurrentClinic } from "@/lib/chatService";
import { setUserRole } from "@/lib/permissionService";
import { setCurrentClinicId } from "@/lib/clinicPermissionService";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulação de login - Substituir por integração real
    setTimeout(() => {
      if (email && password) {
        toast.success("Login realizado com sucesso!");
        // Verificar se é admin
        if (email.includes("admin")) {
          setUserRole("admin");
          navigate("/admin");
        } else {
          // Determinar role baseado no email (mock - em produção viria da API)
          let userRole = "medico";
          if (email.includes("financeiro") || email.includes("finance")) {
            userRole = "financeiro";
          } else if (email.includes("recepcionista") || email.includes("recep")) {
            userRole = "recepcionista";
          }
          
          setUserRole(userRole);
          
          // Definir clínica atual para o chat (em produção viria da API de autenticação)
          // Exemplo: obter nome da clínica do usuário logado
          const clinicName = email.includes("@") 
            ? email.split("@")[1].split(".")[0].replace(/([A-Z])/g, ' $1').trim() || "Minha Clínica"
            : "Minha Clínica";
          const clinicId = Math.floor(Math.random() * 1000) + 1; // Em produção viria da API
          
          setCurrentClinic(clinicName, clinicId);
          setCurrentClinicId(clinicId); // Salvar ID da clínica para verificação de módulos
          navigate("/");
        }
      } else {
        toast.error("Email e senha são obrigatórios");
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 flex items-center justify-center">
            <img src={cactoIcon} alt="CactoSaude" className="w-16 h-16 object-contain" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">CactoSaude</CardTitle>
          <CardDescription className="text-base">
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
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
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
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
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
            <div className="text-center">
              <Link to="/esqueceu-senha">
                <Button variant="link" className="text-sm" type="button">
                  Esqueceu sua senha?
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

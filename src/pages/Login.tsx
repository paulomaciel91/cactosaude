import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import cactoIcon from "@/assets/cacto-icon.png";
import { useAuth } from "@/contexts/AuthContext";
import { setUserRole } from "@/lib/permissionService";
import { setCurrentClinicId } from "@/lib/clinicPermissionService";

const Login = () => {
  const navigate = useNavigate();
  const { profile: authProfile, session: authSession, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirecionamento automático caso já esteja logado ao abrir a página
  useEffect(() => {
    // Se a autenticação global terminou de carregar
    if (!authLoading && authSession) {
      if (authProfile) {
        console.log("Login: Perfil detectado, redirecionando para:", authProfile.role);

        setUserRole(authProfile.role);
        if (authProfile.clinic_id) setCurrentClinicId(authProfile.clinic_id);

        if (authProfile.role === 'admin') {
          navigate("/admin");
        } else {
          navigate("/app");
        }
      } else if (loading) {
        console.warn("Login: Sessão ativa mas perfil não encontrado.");
        setLoading(false);
      }
    }

    // Fallback: se estiver travado em loading por muito tempo com sessão ativa
    const timer = setTimeout(() => {
      if (loading && authSession && !authProfile) {
        console.log("Login: Fallback ativado por demora no perfil.");
        toast.info("Carregamento lento detectado. Verificando acesso...");
        // Tenta buscar o perfil uma última vez de forma isolada
      }
    }, 6000);

    return () => clearTimeout(timer);
  }, [authProfile, authSession, authLoading, navigate, loading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    const toastId = toast.loading("Iniciando acesso...");

    try {
      console.log("Login: Tentando autenticar:", email);

      // 1. Autenticação básica no Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login: Erro no signIn:", error);
        toast.error("Erro ao entrar: " + error.message, { id: toastId });
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log("Login: Autenticação OK. Buscando perfil...");
        toast.loading("Carregando seu perfil...", { id: toastId });

        // Timer para não travar o login
        const profileTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000));

        try {
          // Tenta buscar via SDK primeiro
          const profileQuery = supabase
            .from('profiles')
            .select('id, role, clinic_id, full_name, email')
            .eq('id', data.user.id)
            .limit(1);

          const { data: profileResult, error: profileError } = await Promise.race([profileQuery, profileTimeout]) as any;

          let finalProfile = (profileResult && profileResult.length > 0) ? profileResult[0] : null;

          // Se falhou ou deu timeout, tenta via FETCH NATIVO (bypass no pool do SDK)
          if (!finalProfile) {
            console.warn("Login: SDK falhou/timeout. Tentando via Fetch Nativo...");
            try {
              const restUrl = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${data.user.id}&select=id,role,clinic_id,full_name,email`;
              const response = await fetch(restUrl, {
                headers: {
                  'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                  'Authorization': `Bearer ${data.session?.access_token}`,
                  'Content-Type': 'application/json'
                }
              });
              const fetchResult = await response.json();
              if (fetchResult && fetchResult.length > 0) {
                console.log("Login: Perfil recuperado via Fetch Nativo!");
                finalProfile = fetchResult[0];
              }
            } catch (fetchErr) {
              console.error("Login: Fetch Nativo também falhou:", fetchErr);
            }
          }

          if (!finalProfile) {
            console.warn("Login: Perfil não encontrado. Verificando cache...");
            const cachedRole = localStorage.getItem('CactoSaude_user_role');
            if (cachedRole) {
              finalProfile = {
                role: cachedRole,
                clinic_id: localStorage.getItem('cactosaude_current_clinic_id'),
                full_name: localStorage.getItem('cactosaude_user_name')
              };
            } else {
              toast.error("Não foi possível carregar seu perfil. Tente atualizar a página.", { id: toastId });
              setLoading(false);
              return;
            }
          }

          console.log("Login: Prosseguindo com role:", finalProfile.role);

          // 3. Persistência local obrigatória
          setUserRole(finalProfile.role);
          if (finalProfile.clinic_id) setCurrentClinicId(finalProfile.clinic_id);
          if (finalProfile.full_name) localStorage.setItem('cactosaude_user_name', finalProfile.full_name);

          toast.success("Acesso liberado!", { id: toastId });

          // 4. Redirecionamento forçado
          if (finalProfile.role === 'admin') {
            navigate("/admin");
          } else {
            navigate("/app");
          }
        } catch (pErr) {
          console.error("Login: Erro no passo do perfil:", pErr);
          toast.error("Erro ao carregar seu perfil. Tente atualizar a página.", { id: toastId });
          setLoading(false);
        }
      }
    } catch (err) {
      console.error("Login: Erro fatal inesperado:", err);
      toast.error("Erro interno ao realizar login.", { id: toastId });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 flex items-center justify-center">
            <img src={cactoIcon} alt="CactoSaude" className="w-16 h-16 object-contain" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">CactoSaude</CardTitle>
          <CardDescription className="text-base text-muted-foreground font-medium">
            Sua clínica, simplificada e eficiente
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
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-11"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
            <div className="text-center space-y-2">
              <Link to="/esqueceu-senha" title="Esqueceu sua senha?">
                <Button variant="link" className="text-sm h-auto p-0" type="button">
                  Esqueceu sua senha?
                </Button>
              </Link>
              <div className="text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <Link to="/assinatura" className="text-primary hover:underline font-medium">
                  Cadastre-se
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

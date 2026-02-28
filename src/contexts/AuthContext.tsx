import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  role: string;
  clinic_id: string | null;
  full_name: string | null;
  email: string | null;
}

interface AuthContextType {
  session: any | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, retries = 2): Promise<Profile | null> => {
    console.log(`AuthContext: Buscando perfil para ID: ${userId} (Tentativa: ${3 - retries})`);

    // Timeout maior para conexões lentas
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 15000)
    );

    try {
      // Usando .limit(1) em vez de .single() por ser mais resiliente no client
      const queryPromise = supabase
        .from('profiles')
        .select('id, role, clinic_id, full_name, email')
        .eq('id', userId)
        .limit(1);

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
      let profileData = (data && data.length > 0) ? data[0] : null;

      if (error || !profileData) {
        console.warn("AuthContext: SDK falhou/timeout. Tentando via Fetch Nativo...");
        try {
          const restUrl = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=id,role,clinic_id,full_name,email`;
          const response = await fetch(restUrl, {
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Content-Type': 'application/json'
            }
          });
          const fetchResult = await response.json();
          if (fetchResult && fetchResult.length > 0) {
            console.log("AuthContext: Perfil recuperado via Fetch Nativo!");
            profileData = fetchResult[0];
          }
        } catch (fetchErr) {
          console.error("AuthContext: Fetch Nativo também falhou:", fetchErr);
        }
      }

      if (!profileData) {
        if (retries > 0) {
          console.warn("AuthContext: Retentando busca de perfil...");
          return fetchProfile(userId, retries - 1);
        }

        const savedRole = localStorage.getItem('CactoSaude_user_role');
        if (savedRole) {
          console.log("AuthContext: Usando cargo do cache local como fallback:", savedRole);
          return {
            id: userId,
            role: savedRole,
            clinic_id: localStorage.getItem('cactosaude_current_clinic_id'),
            full_name: localStorage.getItem('cactosaude_user_name'),
            email: localStorage.getItem('cactosaude_user_email'),
          } as Profile;
        }
        return null;
      }

      console.log("AuthContext: Perfil carregado com sucesso:", profileData.role);

      // Atualiza o cache local para futuros fallbacks
      localStorage.setItem('CactoSaude_user_role', profileData.role);
      if (profileData.clinic_id) localStorage.setItem('cactosaude_current_clinic_id', String(profileData.clinic_id));
      if (profileData.full_name) localStorage.setItem('cactosaude_user_name', profileData.full_name || '');

      return profileData as Profile;
    } catch (err) {
      if (retries > 0) {
        return fetchProfile(userId, retries - 1);
      }
      console.error("AuthContext: Busca de perfil falhou definitivamente.");
      return null;
    }
  };

  useEffect(() => {
    // Timeout de segurança global para garantir que o app não fique travado
    const globalLoadingTimeout = setTimeout(() => {
      setLoading(prev => {
        if (prev) console.warn("AuthContext: Forçando saída do estado de loading após 10s.");
        return false;
      });
    }, 10000);

    const checkUser = async () => {
      try {
        console.log("AuthContext: Verificando sessão inicial...");
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);

        if (initialSession?.user?.id) {
          // Busca o perfil em paralelo, sem segurar o loading do app
          fetchProfile(initialSession.user.id).then(setProfile);
        }
      } catch (err) {
        console.error("AuthContext: Erro ao verificar sessão inicial:", err);
      } finally {
        console.log("AuthContext: Sessão verificada. Liberando UI.");
        setLoading(false);
        clearTimeout(globalLoadingTimeout);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`AuthContext: Evento Auth: ${event}`, session?.user?.id);
      setSession(session);

      if (session?.user?.id) {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Busca o perfil sem travar a interface em loading
          fetchProfile(session.user.id).then(profileData => {
            setProfile(profileData);
            console.log("AuthContext: Perfil atualizado em background:", profileData?.role);
          });
        }
      } else {
        setProfile(null);
      }

      // Garante que o loading é liberado se algum evento disparar ele acidentalmente
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

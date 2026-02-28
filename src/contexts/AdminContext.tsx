import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export interface Clinic {
  id: number | string;
  name: string;
  cnpj: string;
  email?: string;
  phone?: string;
  users?: number;
  plan?: string;
  status: string;
  subscriptionStart?: string;
  lastPayment?: string | null;
  nextPayment?: string;
  monthlyValue?: number;
  address?: string;
  enabledModules?: any;
}

interface AdminContextType {
  selectedClinic: Clinic | null;
  setSelectedClinic: (clinic: Clinic | null) => void;
  clinics: Clinic[];
  setClinics: (clinics: Clinic[]) => void;
  loading: boolean;
  refreshClinics: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClinics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('*');

      if (error) throw error;
      setClinics(data || []);

      // If we have a selected clinic ID saved, try to re-select it
      const savedClinicId = localStorage.getItem('cactosaude_admin_selected_clinic_id');
      if (savedClinicId && data) {
        const found = data.find(c => String(c.id) === savedClinicId);
        if (found) setSelectedClinic(found);
      }
    } catch (error) {
      console.error("Erro ao buscar clínicas no AdminContext:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  const handleSetSelectedClinic = (clinic: Clinic | null) => {
    setSelectedClinic(clinic);
    if (clinic) {
      localStorage.setItem('cactosaude_admin_selected_clinic_id', String(clinic.id));
    } else {
      localStorage.removeItem('cactosaude_admin_selected_clinic_id');
    }
  };

  return (
    <AdminContext.Provider
      value={{
        selectedClinic,
        setSelectedClinic: handleSetSelectedClinic,
        clinics,
        setClinics,
        loading,
        refreshClinics: fetchClinics
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}


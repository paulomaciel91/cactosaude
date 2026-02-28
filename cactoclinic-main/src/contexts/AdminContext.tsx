import { createContext, useContext, useState, ReactNode } from "react";

interface Clinic {
  id: number;
  name: string;
  cnpj: string;
  email?: string;
  phone?: string;
  plan: string;
  status: "active" | "pending" | "suspended";
  users?: number;
}

interface AdminContextType {
  selectedClinic: Clinic | null;
  setSelectedClinic: (clinic: Clinic | null) => void;
  clinics: Clinic[];
  setClinics: (clinics: Clinic[]) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([
    { id: 1, name: "Clínica Vida Saudável", cnpj: "12.345.678/0001-90", users: 24, plan: "Premium", status: "active" },
    { id: 2, name: "Centro Médico São Lucas", cnpj: "98.765.432/0001-10", users: 18, plan: "Pro", status: "active" },
    { id: 3, name: "Odonto Excellence", cnpj: "11.222.333/0001-44", users: 12, plan: "Basic", status: "pending" },
    { id: 4, name: "NutriCare", cnpj: "55.666.777/0001-88", users: 8, plan: "Pro", status: "active" },
  ]);

  return (
    <AdminContext.Provider value={{ selectedClinic, setSelectedClinic, clinics, setClinics }}>
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


import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface Clinic {
  id: string | number;
  name: string;
  cnpj?: string;
  address?: string;
  phone?: string;
  email?: string;
  owner_id?: string;
  status?: string;
  plan?: string;
}

export const useClinic = () => {
  const { profile, loading: authLoading } = useAuth();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchClinic = async () => {
      // Don't do anything if auth is still loading
      if (authLoading) return;

      // If no profile, we can't fetch a clinic
      if (!profile) {
        setClinic(null);
        setLoading(false);
        return;
      }

      try {
        let query = supabase.from('clinics').select('*');

        // First attempt: fetch by clinic_id if available on profile
        if (profile.clinic_id) {
          const { data, error } = await query
            .eq('id', profile.clinic_id)
            .maybeSingle();

          if (error) throw error;

          if (data) {
            setClinic(data);
            setLoading(false);
            return;
          }
        }

        // Second attempt: fetch by owner_id if the user is an owner
        const { data: ownerData, error: ownerError } = await supabase
          .from('clinics')
          .select('*')
          .eq('owner_id', profile.id)
          .maybeSingle();

        if (ownerError) throw ownerError;

        if (ownerData) {
          setClinic(ownerData);
        } else {
          setClinic(null);
        }
      } catch (err: any) {
        console.error('Error fetching clinic:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClinic();
  }, [profile, authLoading]);

  return { clinic, loading, error };
};

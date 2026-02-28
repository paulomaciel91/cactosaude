import { supabase } from './supabaseClient';
import { StoreInfo, Product, Stock, Promotion, CartItem, Banner, Customer, DeliveryFee } from '../types';

const api = {
  getStoreInfo: async (slug: string): Promise<StoreInfo | null> => {
    if (!supabase) return null;
    // Busca informações da loja na tabela específica do slug (ex: 'studio_camisaria_info')
    const { data, error } = await supabase
      .from(`${slug}_info`)
      .select('*')
      .single();

    if (error) {
      console.error(`Error fetching store info for slug "${slug}":`, error);
      return null;
    }
    return data;
  },

  getStoreStatus: async (slug: string): Promise<boolean> => {
    if (!supabase) return true;
    const { data, error } = await supabase
      .from('lojas')
      .select('assinatura_ativa')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error(`Error checking store status for slug "${slug}":`, error);
      return false;
    }
    // If store not found in master table, consider inactive/invalid
    if (!data) return false;
    return !!data.assinatura_ativa;
  },

  checkSlugAvailability: async (slug: string): Promise<boolean> => {
    if (!supabase) return true; 
    
    try {
        const { data, error } = await supabase
        .from('lojas')
        .select('slug')
        .eq('slug', slug)
        .maybeSingle();
        
        if (error) {
            console.error("Error checking slug availability:", error);
            return true; // Assume available on error to prevent blocking in edge cases
        }
        
        return !data; // Returns true if available (no data found), false if taken
    } catch (err) {
        console.error("Unexpected error checking slug:", err);
        return true;
    }
  },

  getProducts: async (slug: string): Promise<Product[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from(`${slug}_produtos`)
      .select('*')
      .eq('ativo', true);

    if (error) {
      console.error(`Error fetching products for slug "${slug}":`, error);
      return [];
    }
    return data || [];
  },

  getStock: async (slug: string): Promise<Stock[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from(`${slug}_estoque`)
      .select('*');

    if (error) {
      console.error(`Error fetching stock for slug "${slug}":`, error);
      return [];
    }
    return data || [];
  },

  getPromotions: async (slug: string): Promise<Promotion[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from(`${slug}_promocoes`)
      .select('*')
      .eq('ativo', true);

    if (error) {
      console.error(`Error fetching promotions for slug "${slug}":`, error);
      return [];
    }
    return data || [];
  },

  getDeliveryFees: async (slug: string): Promise<DeliveryFee[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from(`${slug}_taxas_entrega`)
      .select('*');

    if (error) {
      console.error(`Error fetching delivery fees for slug "${slug}":`, error);
      return [];
    }
    return data || [];
  },

  getCart: async (slug: string, cartUuid: string): Promise<{ itens: CartItem[]; carrinho_id: number } | null> => {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from(`${slug}_carrinhos`)
      .select('itens, carrinho_id')
      .eq('carrinho_uuid', cartUuid)
      .single();
    
    if (error) {
      console.error(`Error fetching cart for slug "${slug}" with UUID "${cartUuid}":`, error);
      return null;
    }
    return data as { itens: CartItem[]; carrinho_id: number } | null;
  },
      
  createCart: async (slug: string, items: CartItem[], total: number): Promise<{ carrinho_uuid: string; carrinho_id: number } | null> => {
    if (!supabase) return null;
    const newUuid = crypto.randomUUID();
    const { data, error } = await supabase
      .from(`${slug}_carrinhos`)
      .insert({
        carrinho_uuid: newUuid,
        itens: items,
        valor_total: total,
        status: 'ativo',
      })
      .select('carrinho_uuid, carrinho_id')
      .single();

    if (error) {
      console.error(`Error creating cart for slug "${slug}":`, error);
      return null;
    }
    return data;
  },
    
  updateCart: async (slug: string, cartUuid: string, items: CartItem[], total: number): Promise<void> => {
    if (!supabase) return;
    const { error } = await supabase
      .from(`${slug}_carrinhos`)
      .update({
        itens: items,
        valor_total: total,
      })
      .eq('carrinho_uuid', cartUuid);
    
    if (error) {
      console.error(`Error updating cart for slug "${slug}":`, error);
    }
  }
};

export default api;
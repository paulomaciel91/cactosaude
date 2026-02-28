
import { supabase } from './supabaseClient';
import { CartItem, Customer, Promotion } from '../types';

export const createPaymentPreference = async (
  slug: string,
  cartItems: CartItem[],
  total: number,
  customer: Customer,
  cartId: number | null,
  shippingCost: number = 0,
  coupon: Promotion | null = null
): Promise<string | null> => {
  try {
    if (!supabase) {
        throw new Error("Cliente Supabase não inicializado.");
    }

    const payload = {
      slug,
      cart: {
        id: cartId,
        items: cartItems.map(item => {
            const attrs = Object.entries(item.atributos || {})
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ');
            
            return {
                id: item.produto_id,
                title: item.nome,
                quantity: item.quantidade,
                unit_price: item.preco_unitario,
                description: `${item.nome}${attrs ? ' - ' + attrs : ''}`
            };
        }),
        total, 
        shipping_cost: shippingCost,
        coupon: coupon ? {
            code: coupon.codigo_cupom,
            discount_type: coupon.tipo_desconto,
            discount_value: coupon.valor_desconto,
            name: coupon.nome
        } : null
      },
      customer: {
        name: customer.nome,
        phone: customer.telefone,
        document: customer.cpf,
        email: customer.email,
        address: customer.endereco
      }
    };

    console.log("Iniciando checkout seguro via Supabase RPC...", payload);

    // CHAMADA SEGURA VIA EDGE FUNCTION (Postgres Function 'create_checkout')
    // A URL do n8n está protegida dentro da função do banco de dados.
    const { data, error } = await supabase.rpc('create_checkout', {
        payload: payload
    });

    if (error) {
        console.error('Erro no RPC do Supabase:', error);
        throw new Error(`Falha na comunicação segura: ${error.message}`);
    }

    // Verifica se a função SQL retornou um objeto de erro customizado (definido no SQL)
    if (data && data.error) {
        console.error('Erro retornado pelo serviço de pagamento (via RPC):', data);
        throw new Error(data.error || "Erro ao processar pagamento.");
    }

    console.log("Resposta do Checkout (RPC):", data);

    // --- LÓGICA DE EXTRAÇÃO DA RESPOSTA (Compatível com n8n) ---
    
    // 1. Caso venha num array (padrão n8n webhook response array)
    if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        // Verifica se o item tem 'body' (estrutura comum do n8n) ou propriedades diretas
        const content = item.body || item; 
        
        if (content.init_point) return content.init_point;
        if (content.sandbox_init_point) return content.sandbox_init_point;
    } 
    
    // 2. Fallback: objeto direto
    // @ts-ignore
    if (data.init_point) return data.init_point;
    // @ts-ignore
    if (data.sandbox_init_point) return data.sandbox_init_point;

    console.error("Link 'init_point' não encontrado na resposta:", data);
    throw new Error("O servidor não retornou o link de pagamento corretamente.");

  } catch (error) {
    console.error('Falha crítica ao criar preferência de pagamento:', error);
    throw error; // Relança o erro para o modal exibir a mensagem
  }
};

export const createSubscription = async (payload: any): Promise<any> => {
  try {
    if (!supabase) {
        throw new Error("Supabase client not initialized");
    }

    const { data, error } = await supabase.rpc('create_subscription', {
      payload: payload
    });

    if (error) {
      console.error('Supabase RPC Error (Subscription):', error);
      throw error;
    }

    return data;

  } catch (error) {
    console.error('Failed to create subscription:', error);
    return null;
  }
};

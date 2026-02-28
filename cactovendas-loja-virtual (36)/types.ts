
export interface StoreInfo {
  nome_loja: string | null;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  slug: string | null;
  logo: string | { url: string } | null;
  email: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
  horario_atendimento: string | null;
  endereco: string | null;
  banner_imagem_desktop_url?: { url: string }[] | string | null;
  banner_imagem_mobile_url?: { url: string }[] | string | null;
  banner_link_url?: string | null;
  cor_primaria?: string | null;
  cor_secundaria?: string | null;
  plano?: string | null; // 'start' | 'pro' | null
  logistica_config?: {
    frete?: {
      tipo: 'tabela_fixa' | 'por_distancia';
      valor_por_km?: number;
      frete_minimo?: number;
      raio_maximo_km?: number;
    };
    entregas?: {
      tempo_estimado?: string;
    };
  } | null;
}

export interface Product {
  produto_id: number;
  nome: string;
  descricao: string | null;
  preco: number;
  categoria: string | null;
  imagens: { url: string }[] | null;
  destaque: boolean | null;
  ativo: boolean | null;
  chaves_atributos: string[] | null; // Array of keys, e.g., ["Tamanho", "Cor", "Voltagem"]
}

export interface Stock {
  estoque_id?: number;
  produto_id: number | null;
  atributos: Record<string, string> | null; // e.g., { "Tamanho": "M", "Cor": "Azul" }
  quantidade: number | null;
}

export interface Promotion {
  tipo_desconto: 'percentual' | 'fixo' | 'frete_gratis' | 'shipping' | 'frete';
  valor_desconto: number;
  categorias?: string[];
  produtos_ids?: number[];
  ativo: boolean;
  nome?: string;
  valor_minimo?: number;
  codigo_cupom?: string | null;
}

export interface DeliveryFee {
  taxa_id: number;
  regiao: string;
  custo: number;
}

export interface CartItem {
  id: string; 
  produto_id: number;
  estoque_id?: number;
  nome: string;
  categoria?: string | null; // Added category for shipping rules
  imagem: string | undefined;
  atributos: Record<string, string>; // Dynamic attributes
  quantidade: number;
  preco_unitario: number;
  preco_original: number;
}

export interface Banner {
  imagem_desktop_url: string;
  imagem_mobile_url: string;
  link_url?: string | null;
}

export interface Address {
  zip: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Customer {
  nome: string;
  telefone: string;
  cpf?: string;
  email?: string;
  endereco?: Address;
}

// Fixed missing types for document processing and ABNT formatting
export enum FileType {
  PDF = 'application/pdf',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
}

export interface ProcessedDocument {
  fileName: string;
  formattedText: string;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
}

export interface ABNTDocumentData {
  institution: string;
  author: string;
  title: string;
  subtitle?: string;
  city: string;
  year: string;
  preamble?: string;
  resumo?: string;
  abstract?: string;
  introduction: string;
  development: Chapter[];
  conclusion: string;
  references: string;
}

// Serviço de gerenciamento TISS (Troca de Informação em Saúde Suplementar)

export interface Convenio {
  id: number;
  nome: string;
  codigoANS: string;
  cnpj: string;
  codigoPrestador: string;
  loginPortal?: string;
  senhaPortal?: string; // criptografado
  email: string;
  webhookN8N?: string;
  tabelaPrecos: 'TUSS' | 'PROPRIA' | 'PERCENTUAL';
  percentualSobreTabela?: number;
  diasParaPagamento: number;
  ativo: boolean;
  createdAt: string;
}

export interface GuiaTISS {
  id: string;
  numeroGuia: string;
  tipoGuia: 'CONSULTA' | 'SP_SADT' | 'HONORARIOS' | 'AUTORIZACAO' | 'INTERNACAO';
  status: 'RASCUNHO' | 'FINALIZADA' | 'ENVIADA' | 'PAGA' | 'GLOSADA' | 'CANCELADA';
  convenioId: number;
  convenioNome: string;
  
  // Dados do paciente
  pacienteId: number;
  pacienteNome: string;
  pacienteCpf: string;
  pacienteCarteirinha: string;
  pacienteValidadeCarteirinha: string;
  
  // Dados do profissional
  profissionalNome: string;
  profissionalCrm: string;
  profissionalCrmEstado: string;
  profissionalCbo: string;
  
  // Dados clínicos
  cid10: string;
  cid10Descricao: string;
  indicacaoClinica: string;
  
  // Procedimentos
  procedimentos: ProcedimentoTUSS[];
  
  // Valores
  valorTotal: number;
  valorPago?: number;
  valorGlosado?: number;
  
  // Datas
  dataAtendimento: string;
  dataEmissao: string;
  dataEnvio?: string;
  dataPagamento?: string;
  
  // Lote
  loteId?: string;
  
  // Glosas
  glosas?: Glosa[];
  
  // Outros
  observacoes?: string;
  anexos?: string[];
  xmlGerado?: string;
  protocoloEnvio?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface ProcedimentoTUSS {
  codigoTUSS: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  dataRealizacao: string;
}

export interface LoteFaturamento {
  id: string;
  numeroLote: string;
  convenioId: number;
  convenioNome: string;
  competencia: string; // MM/AAAA
  status: 'ABERTO' | 'FECHADO' | 'ENVIADO' | 'PROCESSADO' | 'CANCELADO';
  guias: string[]; // IDs das guias
  valorTotal: number;
  valorPago?: number;
  valorGlosado?: number;
  dataCriacao: string;
  dataFechamento?: string;
  dataEnvio?: string;
  protocoloEnvio?: string;
  xmlGerado?: string;
  retornoProcessado?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RetornoXML {
  id: string;
  loteId: string;
  protocolo: string;
  arquivoXml: string;
  dataProcessamento: string;
  valorTotal: number;
  valorPago: number;
  valorGlosado: number;
  guiasProcessadas: number;
  glosasIdentificadas: number;
  status: 'PROCESSADO' | 'ERRO';
  erros?: string[];
  createdAt: string;
}

export interface Glosa {
  id: string;
  guiaId: string;
  numeroGuia: string;
  convenioId: number;
  convenioNome: string;
  codigoGlosa: string;
  motivoGlosa: string;
  valorGlosado: number;
  status: 'PENDENTE' | 'EM_CONTESTACAO' | 'REVERTIDA' | 'ACEITA';
  dataGlosa: string;
  dataContestacao?: string;
  protocoloContestacao?: string;
  justificativaContestacao?: string;
  documentosContestacao?: string[];
  prazoContestacao: string;
  diasRestantes: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConfiguracaoTISS {
  prestador: {
    razaoSocial: string;
    cnpj: string;
    cnes: string;
    codigoANS: string;
    endereco: string;
    cidade: string;
    estado: string;
    cep: string;
    telefone: string;
    email: string;
    responsavelTecnico: string;
    responsavelTecnicoCRM: string;
  };
  versaoTISS: '4.0' | '3.04.01';
  schemaXSD: string;
  formatoNumeracao: {
    guias: string;
    lotes: string;
  };
  validacoes: {
    validarCPF: boolean;
    validarCarteirinha: boolean;
    validarCID10: boolean;
    validarTUSS: boolean;
    validarCarencias: boolean;
    validarAutorizacao: boolean;
  };
  integracaoN8N?: {
    url: string;
    token: string;
    eventos: string[];
  };
  notificacoes: {
    guiasPendentes: boolean;
    glosas: boolean;
    prazos: boolean;
    canais: ('sistema' | 'email' | 'n8n')[];
  };
}

// Chaves de armazenamento
const CONVENIOS_STORAGE_KEY = 'CactoSaude_convenios';
const GUIAS_STORAGE_KEY = 'CactoSaude_guias_tiss';
const LOTES_STORAGE_KEY = 'CactoSaude_lotes_tiss';
const RETORNOS_STORAGE_KEY = 'CactoSaude_retornos_tiss';
const GLOSAS_STORAGE_KEY = 'CactoSaude_glosas_tiss';
const CONFIG_TISS_STORAGE_KEY = 'CactoSaude_config_tiss';

// Funções auxiliares
const generateGuiaNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `${year}${random}`;
};

const generateLoteNumber = (competencia: string): string => {
  const competenciaClean = competencia.replace('/', '');
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `LOTE${competenciaClean}${random}`;
};

export const tissService = {
  // ========== CONVÊNIOS ==========
  getAllConvenios: (): Convenio[] => {
    try {
      const stored = localStorage.getItem(CONVENIOS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  getConvenioById: (id: number): Convenio | undefined => {
    return tissService.getAllConvenios().find(c => c.id === id);
  },

  createConvenio: (convenio: Omit<Convenio, 'id' | 'createdAt'>): Convenio => {
    const convenios = tissService.getAllConvenios();
    const newId = convenios.length > 0 ? Math.max(...convenios.map(c => c.id)) + 1 : 1;
    const newConvenio: Convenio = {
      ...convenio,
      id: newId,
      createdAt: new Date().toISOString()
    };
    convenios.push(newConvenio);
    localStorage.setItem(CONVENIOS_STORAGE_KEY, JSON.stringify(convenios));
    window.dispatchEvent(new CustomEvent('convenioCreated', { detail: newConvenio }));
    return newConvenio;
  },

  updateConvenio: (id: number, updates: Partial<Convenio>): Convenio | null => {
    const convenios = tissService.getAllConvenios();
    const index = convenios.findIndex(c => c.id === id);
    if (index === -1) return null;
    convenios[index] = { ...convenios[index], ...updates };
    localStorage.setItem(CONVENIOS_STORAGE_KEY, JSON.stringify(convenios));
    window.dispatchEvent(new CustomEvent('convenioUpdated', { detail: convenios[index] }));
    return convenios[index];
  },

  deleteConvenio: (id: number): boolean => {
    const convenios = tissService.getAllConvenios().filter(c => c.id !== id);
    localStorage.setItem(CONVENIOS_STORAGE_KEY, JSON.stringify(convenios));
    return true;
  },

  // ========== GUIAS TISS ==========
  getAllGuias: (): GuiaTISS[] => {
    try {
      const stored = localStorage.getItem(GUIAS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  getGuiaById: (id: string): GuiaTISS | undefined => {
    return tissService.getAllGuias().find(g => g.id === id);
  },

  createGuia: (guia: Omit<GuiaTISS, 'id' | 'numeroGuia' | 'createdAt' | 'updatedAt'>): GuiaTISS => {
    const guias = tissService.getAllGuias();
    const id = `GUIA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const numeroGuia = generateGuiaNumber();
    const newGuia: GuiaTISS = {
      ...guia,
      id,
      numeroGuia,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    guias.push(newGuia);
    localStorage.setItem(GUIAS_STORAGE_KEY, JSON.stringify(guias));
    window.dispatchEvent(new CustomEvent('guiaCreated', { detail: newGuia }));
    return newGuia;
  },

  updateGuia: (id: string, updates: Partial<GuiaTISS>): GuiaTISS | null => {
    const guias = tissService.getAllGuias();
    const index = guias.findIndex(g => g.id === id);
    if (index === -1) return null;
    guias[index] = { ...guias[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(GUIAS_STORAGE_KEY, JSON.stringify(guias));
    window.dispatchEvent(new CustomEvent('guiaUpdated', { detail: guias[index] }));
    return guias[index];
  },

  deleteGuia: (id: string): boolean => {
    const guias = tissService.getAllGuias().filter(g => g.id !== id);
    localStorage.setItem(GUIAS_STORAGE_KEY, JSON.stringify(guias));
    return true;
  },

  // ========== LOTES ==========
  getAllLotes: (): LoteFaturamento[] => {
    try {
      const stored = localStorage.getItem(LOTES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  getLoteById: (id: string): LoteFaturamento | undefined => {
    return tissService.getAllLotes().find(l => l.id === id);
  },

  createLote: (lote: Omit<LoteFaturamento, 'id' | 'numeroLote' | 'createdAt' | 'updatedAt'>): LoteFaturamento => {
    const lotes = tissService.getAllLotes();
    const id = `LOTE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const numeroLote = generateLoteNumber(lote.competencia);
    const newLote: LoteFaturamento = {
      ...lote,
      id,
      numeroLote,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    lotes.push(newLote);
    localStorage.setItem(LOTES_STORAGE_KEY, JSON.stringify(lotes));
    window.dispatchEvent(new CustomEvent('loteCreated', { detail: newLote }));
    return newLote;
  },

  updateLote: (id: string, updates: Partial<LoteFaturamento>): LoteFaturamento | null => {
    const lotes = tissService.getAllLotes();
    const index = lotes.findIndex(l => l.id === id);
    if (index === -1) return null;
    lotes[index] = { ...lotes[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(LOTES_STORAGE_KEY, JSON.stringify(lotes));
    return lotes[index];
  },

  // ========== RETORNOS ==========
  getAllRetornos: (): RetornoXML[] => {
    try {
      const stored = localStorage.getItem(RETORNOS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  createRetorno: (retorno: Omit<RetornoXML, 'id' | 'createdAt'>): RetornoXML => {
    const retornos = tissService.getAllRetornos();
    const id = `RET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newRetorno: RetornoXML = {
      ...retorno,
      id,
      createdAt: new Date().toISOString()
    };
    retornos.push(newRetorno);
    localStorage.setItem(RETORNOS_STORAGE_KEY, JSON.stringify(retornos));
    return newRetorno;
  },

  // ========== GLOSAS ==========
  getAllGlosas: (): Glosa[] => {
    try {
      const stored = localStorage.getItem(GLOSAS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  getGlosaById: (id: string): Glosa | undefined => {
    return tissService.getAllGlosas().find(g => g.id === id);
  },

  createGlosa: (glosa: Omit<Glosa, 'id' | 'createdAt' | 'updatedAt'>): Glosa => {
    const glosas = tissService.getAllGlosas();
    const id = `GLOSA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newGlosa: Glosa = {
      ...glosa,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    glosas.push(newGlosa);
    localStorage.setItem(GLOSAS_STORAGE_KEY, JSON.stringify(glosas));
    return newGlosa;
  },

  updateGlosa: (id: string, updates: Partial<Glosa>): Glosa | null => {
    const glosas = tissService.getAllGlosas();
    const index = glosas.findIndex(g => g.id === id);
    if (index === -1) return null;
    glosas[index] = { ...glosas[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(GLOSAS_STORAGE_KEY, JSON.stringify(glosas));
    return glosas[index];
  },

  // ========== CONFIGURAÇÕES ==========
  getConfig: (): ConfiguracaoTISS | null => {
    try {
      const stored = localStorage.getItem(CONFIG_TISS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  saveConfig: (config: ConfiguracaoTISS): void => {
    localStorage.setItem(CONFIG_TISS_STORAGE_KEY, JSON.stringify(config));
  },

  // ========== ESTATÍSTICAS ==========
  getEstatisticas: () => {
    const guias = tissService.getAllGuias();
    const lotes = tissService.getAllLotes();
    const glosas = tissService.getAllGlosas();

    const valorAFaturar = guias
      .filter(g => g.status === 'FINALIZADA' || g.status === 'RASCUNHO')
      .reduce((sum, g) => sum + g.valorTotal, 0);

    const lotesAbertos = lotes.filter(l => l.status === 'ABERTO').length;
    const lotesEnviados = lotes.filter(l => l.status === 'ENVIADO').length;
    const guiasPagas = guias.filter(g => g.status === 'PAGA').length;
    
    const valorGlosado = glosas
      .filter(g => g.status === 'PENDENTE' || g.status === 'EM_CONTESTACAO')
      .reduce((sum, g) => sum + g.valorGlosado, 0);

    return {
      valorAFaturar,
      lotesAbertos,
      lotesEnviados,
      guiasPagas,
      valorGlosado,
      totalGuias: guias.length,
      totalLotes: lotes.length,
      totalGlosas: glosas.length
    };
  }
};


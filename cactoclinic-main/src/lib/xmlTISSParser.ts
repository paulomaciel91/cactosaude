// Parser de XML de Retorno TISS

import { RetornoXML, GuiaTISS, Glosa } from './tissService';
import { tissIntegrations } from './tissIntegrations';

export interface ParsedRetorno {
  protocolo: string;
  loteId: string;
  guiasProcessadas: Array<{
    numeroGuia: string;
    status: string;
    valorPago: number;
    valorGlosado: number;
    glosas?: Array<{
      codigo: string;
      motivo: string;
      valor: number;
    }>;
  }>;
  valorTotal: number;
  valorPago: number;
  valorGlosado: number;
}

export const xmlTISSParser = {
  // Parsear XML de retorno
  parseRetornoXML: (xmlContent: string, loteId: string): ParsedRetorno | null => {
    try {
      // Parser básico - em produção, usar DOMParser ou biblioteca XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
      
      // Verificar erros de parsing
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('Erro ao parsear XML');
      }

      // Extrair protocolo
      const protocoloElement = xmlDoc.querySelector('protocoloRecebimento, protocolo');
      const protocolo = protocoloElement?.textContent || `PROT-${Date.now()}`;

      // Extrair informações das guias processadas
      const guiasElements = xmlDoc.querySelectorAll('guia, guiaTISS');
      const guiasProcessadas: ParsedRetorno['guiasProcessadas'] = [];

      let valorTotal = 0;
      let valorPago = 0;
      let valorGlosado = 0;

      guiasElements.forEach((guiaEl) => {
        const numeroGuia = guiaEl.querySelector('numeroGuiaPrestador, numeroGuia')?.textContent || '';
        const statusElement = guiaEl.querySelector('situacaoGuia, status');
        const status = statusElement?.textContent || 'PROCESSADA';
        
        const valorPagoEl = guiaEl.querySelector('valorPago, valorLiquido');
        const valorPagoGuia = parseFloat(valorPagoEl?.textContent || '0');
        
        const valorGlosadoEl = guiaEl.querySelector('valorGlosa, valorGlosado');
        const valorGlosadoGuia = parseFloat(valorGlosadoEl?.textContent || '0');

        const glosas: Array<{ codigo: string; motivo: string; valor: number }> = [];
        const glosasElements = guiaEl.querySelectorAll('glosa, motivoGlosa');
        glosasElements.forEach((glosaEl) => {
          const codigo = glosaEl.querySelector('codigoGlosa, codigo')?.textContent || '';
          const motivo = glosaEl.querySelector('descricaoGlosa, motivo')?.textContent || '';
          const valor = parseFloat(glosaEl.querySelector('valorGlosado, valor')?.textContent || '0');
          glosas.push({ codigo, motivo, valor });
        });

        guiasProcessadas.push({
          numeroGuia,
          status,
          valorPago: valorPagoGuia,
          valorGlosado: valorGlosadoGuia,
          glosas: glosas.length > 0 ? glosas : undefined
        });

        valorTotal += valorPagoGuia + valorGlosadoGuia;
        valorPago += valorPagoGuia;
        valorGlosado += valorGlosadoGuia;
      });

      return {
        protocolo,
        loteId,
        guiasProcessadas,
        valorTotal,
        valorPago,
        valorGlosado
      };
    } catch (error) {
      console.error('Erro ao parsear XML:', error);
      return null;
    }
  },

  // Processar retorno e atualizar guias/glosas
  processarRetorno: (
    parsedRetorno: ParsedRetorno,
    guias: GuiaTISS[]
  ): {
    guiasAtualizadas: number;
    glosasCriadas: number;
  } => {
    let guiasAtualizadas = 0;
    let glosasCriadas = 0;

    parsedRetorno.guiasProcessadas.forEach((guiaProcessada) => {
      const guia = guias.find(g => g.numeroGuia === guiaProcessada.numeroGuia);
      if (!guia) return;

      // Atualizar status da guia
      const novoStatus = guiaProcessada.status.includes('PAGA') || guiaProcessada.status.includes('LIQUIDADA')
        ? 'PAGA'
        : guiaProcessada.status.includes('GLOSADA')
        ? 'GLOSADA'
        : 'ENVIADA';

      const { tissService } = require('./tissService');
      const guiaAtualizada = tissService.updateGuia(guia.id, {
        status: novoStatus as any,
        valorPago: guiaProcessada.valorPago,
        valorGlosado: guiaProcessada.valorGlosado,
        dataPagamento: novoStatus === 'PAGA' ? new Date().toISOString() : undefined
      });

      guiasAtualizadas++;

      // Se a guia foi paga, criar recebimento no Financeiro e baixa no Pagamentos
      if (novoStatus === 'PAGA' && guiaAtualizada && guiaProcessada.valorPago > 0) {
        tissIntegrations.criarRecebimentoFinanceiro(guiaAtualizada);
        tissIntegrations.criarBaixaPagamento(guiaAtualizada);
      }

      // Criar glosas se houver
      if (guiaProcessada.glosas && guiaProcessada.glosas.length > 0) {
        guiaProcessada.glosas.forEach((glosaData) => {
          const glosa = tissService.createGlosa({
            guiaId: guia.id,
            numeroGuia: guia.numeroGuia,
            convenioId: guia.convenioId,
            convenioNome: guia.convenioNome,
            codigoGlosa: glosaData.codigo,
            motivoGlosa: glosaData.motivo,
            valorGlosado: glosaData.valor,
            status: 'PENDENTE',
            dataGlosa: new Date().toISOString(),
            prazoContestacao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
            diasRestantes: 30
          });
          glosasCriadas++;
        });
      }
    });

    return { guiasAtualizadas, glosasCriadas };
  }
};


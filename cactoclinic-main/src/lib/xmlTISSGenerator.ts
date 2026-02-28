// Gerador de XML TISS

import { GuiaTISS, LoteFaturamento } from './tissService';
import { ConfiguracaoTISS } from './tissService';

export const xmlTISSGenerator = {
  // Gerar XML para um lote
  generateLoteXML: (lote: LoteFaturamento, guias: GuiaTISS[], config: ConfiguracaoTISS | null): string => {
    const prestador = config?.prestador || {
      razaoSocial: '',
      cnpj: '',
      cnes: '',
      codigoANS: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      telefone: '',
      email: '',
      responsavelTecnico: '',
      responsavelTecnicoCRM: ''
    };

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ans:mensagemTISS xmlns:ans="http://www.ans.gov.br/padroes/tiss/schemas" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.ans.gov.br/padroes/tiss/schemas http://www.ans.gov.br/padroes/tiss/schemas/tissV4_00_00.xsd">
  <ans:cabecalho>
    <ans:identificacaoTransacao>
      <ans:tipoTransacao>ENVIO_LOTE_GUIAS</ans:tipoTransacao>
      <ans:sequencialTransacao>1</ans:sequencialTransacao>
      <ans:dataRegistroTransacao>${new Date().toISOString().split('T')[0]}</ans:dataRegistroTransacao>
      <ans:horaRegistroTransacao>${new Date().toTimeString().split(' ')[0]}</ans:horaRegistroTransacao>
    </ans:identificacaoTransacao>
    <ans:origem>
      <ans:identificacaoPrestador>
        <ans:codigoPrestadorNaOperadora>${prestador.cnes}</ans:codigoPrestadorNaOperadora>
      </ans:identificacaoPrestador>
    </ans:origem>
    <ans:destino>
      <ans:registroANS>${lote.convenioNome}</ans:registroANS>
    </ans:destino>
    <ans:versaoPadrao>4.00.00</ans:versaoPadrao>
  </ans:cabecalho>
  <ans:prestadorParaOperadora>
    <ans:loteGuias>
      <ans:numeroLote>${lote.numeroLote}</ans:numeroLote>
      <ans:guiasTISS>
        ${guias.map(guia => generateGuiaXML(guia, prestador)).join('\n        ')}
      </ans:guiasTISS>
    </ans:loteGuias>
  </ans:prestadorParaOperadora>
  <ans:epilogo>
    <ans:hash>${generateHash(lote, guias)}</ans:hash>
  </ans:epilogo>
</ans:mensagemTISS>`;

    return xml;
  },

  // Gerar XML para uma guia individual
  generateGuiaXML: (guia: GuiaTISS, prestador: any): string => {
    return generateGuiaXML(guia, prestador);
  },

  // Validar XML contra schema
  validateXML: (xml: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Validações básicas
    if (!xml.includes('<?xml')) {
      errors.push('XML inválido: falta declaração XML');
    }
    
    if (!xml.includes('mensagemTISS')) {
      errors.push('XML inválido: estrutura TISS não encontrada');
    }
    
    // Validações de campos obrigatórios podem ser adicionadas aqui
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
};

function generateGuiaXML(guia: GuiaTISS, prestador: any): string {
  const tipoGuiaMap: Record<string, string> = {
    'CONSULTA': 'Consulta',
    'SP_SADT': 'SP/SADT',
    'HONORARIOS': 'Honorários',
    'AUTORIZACAO': 'Autorização',
    'INTERNACAO': 'Internação'
  };

  return `
        <ans:guiaTISS>
          <ans:cabecalhoGuia>
            <ans:numeroGuiaPrestador>${guia.numeroGuia}</ans:numeroGuiaPrestador>
            <ans:numeroGuiaOperadora></ans:numeroGuiaOperadora>
            <ans:numeroGuiaPrincipal></ans:numeroGuiaPrincipal>
            <ans:dataAutorizacao>${guia.dataAtendimento}</ans:dataAutorizacao>
            <ans:senha></ans:senha>
            <ans:dataValidadeSenha></ans:dataValidadeSenha>
            <ans:numeroCarteira>${guia.pacienteCarteirinha || ''}</ans:numeroCarteira>
            <ans:validadeCarteira>${guia.pacienteValidadeCarteirinha || ''}</ans:validadeCarteira>
            <ans:atendimentoRN></ans:atendimentoRN>
            <ans:indicadorClinico></ans:indicadorClinico>
          </ans:cabecalhoGuia>
          <ans:dadosBeneficiario>
            <ans:numeroCarteira>${guia.pacienteCarteirinha || ''}</ans:numeroCarteira>
            <ans:nomeBeneficiario>${guia.pacienteNome}</ans:nomeBeneficiario>
            <ans:numeroCNS></ans:numeroCNS>
            <ans:identificadorBeneficiario>
              <ans:cpf>${guia.pacienteCpf || ''}</ans:cpf>
            </ans:identificadorBeneficiario>
          </ans:dadosBeneficiario>
          <ans:dadosContratado>
            <ans:identificacaoPrestador>
              <ans:cnpjPrestador>${prestador.cnpj}</ans:cnpjPrestador>
              <ans:codigoPrestadorNaOperadora>${prestador.cnes}</ans:codigoPrestadorNaOperadora>
            </ans:identificacaoPrestador>
            <ans:nomeContratado>${prestador.razaoSocial}</ans:nomeContratado>
            <ans:enderecoContratado>
              <ans:endereco>${prestador.endereco}</ans:endereco>
              <ans:numero></ans:numero>
              <ans:complemento></ans:complemento>
              <ans:cidade>${prestador.cidade}</ans:cidade>
              <ans:uf>${prestador.estado}</ans:uf>
              <ans:cep>${prestador.cep}</ans:cep>
            </ans:enderecoContratado>
          </ans:dadosContratado>
          <ans:profissionalExecutante>
            <ans:identificacaoProfissional>
              <ans:codigoPrestadorNaOperadora>${prestador.cnes}</ans:codigoPrestadorNaOperadora>
              <ans:cpfContratado></ans:cpfContratado>
              <ans:cpfProfissional></ans:cpfProfissional>
              <ans:registroANS></ans:registroANS>
              <ans:numeroConselhoProfissional>${guia.profissionalCrm || ''}</ans:numeroConselhoProfissional>
              <ans:conselhoProfissional>CRM</ans:conselhoProfissional>
              <ans:ufConselho>${guia.profissionalCrmEstado || 'SP'}</ans:ufConselho>
              <ans:cbos>${guia.profissionalCbo || ''}</ans:cbos>
            </ans:identificacaoProfissional>
            <ans:nomeProfissional>${guia.profissionalNome || ''}</ans:nomeProfissional>
          </ans:profissionalExecutante>
          <ans:indicacaoClinica>
            <ans:cid10>
              <ans:codigoDoenca>${guia.cid10 || ''}</ans:codigoDoenca>
              <ans:descricaoDoenca>${guia.cid10Descricao || ''}</ans:descricaoDoenca>
            </ans:cid10>
            <ans:indicacaoAcidente>N</ans:indicacaoAcidente>
            <ans:motivoEncerramento>${guia.indicacaoClinica || ''}</ans:motivoEncerramento>
          </ans:indicacaoClinica>
          <ans:procedimentosExecutados>
            ${guia.procedimentos.map(proc => `
            <ans:procedimentoExecutado>
              <ans:dataExecucao>${proc.dataRealizacao}</ans:dataExecucao>
              <ans:procedimento>
                <ans:codigoTabela>22</ans:codigoTabela>
                <ans:codigoProcedimento>${proc.codigoTUSS}</ans:codigoProcedimento>
                <ans:descricaoProcedimento>${proc.descricao}</ans:descricaoProcedimento>
              </ans:procedimento>
              <ans:quantidadeExecutada>${proc.quantidade}</ans:quantidadeExecutada>
              <ans:reducaoAcrescimo>0.00</ans:reducaoAcrescimo>
              <ans:valorUnitario>${proc.valorUnitario.toFixed(2)}</ans:valorUnitario>
              <ans:valorTotal>${proc.valorTotal.toFixed(2)}</ans:valorTotal>
            </ans:procedimentoExecutado>
            `).join('')}
          </ans:procedimentosExecutados>
          <ans:valorTotal>
            <ans:valorProcedimentos>${guia.valorTotal.toFixed(2)}</ans:valorProcedimentos>
            <ans:valorDesconto>0.00</ans:valorDesconto>
            <ans:valorGlosa>0.00</ans:valorGlosa>
            <ans:valorLiquido>${guia.valorTotal.toFixed(2)}</ans:valorLiquido>
          </ans:valorTotal>
          <ans:observacao>${guia.observacoes || ''}</ans:observacao>
        </ans:guiaTISS>`;
}

function generateHash(lote: LoteFaturamento, guias: GuiaTISS[]): string {
  // Hash simples para validação (em produção, usar algoritmo criptográfico)
  const data = `${lote.numeroLote}-${lote.competencia}-${guias.length}-${Date.now()}`;
  return btoa(data).substr(0, 32).toUpperCase();
}


// Tabela TUSS (exemplos - em produção, importar tabela completa)

export interface ProcedimentoTUSS {
  codigo: string;
  descricao: string;
  categoria: string;
  valorBase?: number;
}

export const tussTable: ProcedimentoTUSS[] = [
  { codigo: '20101010', descricao: 'Consulta médica em consultório', categoria: 'Consulta', valorBase: 150.00 },
  { codigo: '20101011', descricao: 'Consulta médica em domicílio', categoria: 'Consulta', valorBase: 250.00 },
  { codigo: '20101012', descricao: 'Consulta médica em pronto-socorro', categoria: 'Consulta', valorBase: 200.00 },
  { codigo: '31001012', descricao: 'Hemograma completo', categoria: 'Laboratorial', valorBase: 45.00 },
  { codigo: '31001013', descricao: 'Glicemia de jejum', categoria: 'Laboratorial', valorBase: 15.00 },
  { codigo: '31001014', descricao: 'Colesterol total', categoria: 'Laboratorial', valorBase: 20.00 },
  { codigo: '31001015', descricao: 'Triglicerídeos', categoria: 'Laboratorial', valorBase: 20.00 },
  { codigo: '31001016', descricao: 'TSH', categoria: 'Laboratorial', valorBase: 35.00 },
  { codigo: '31001017', descricao: 'T4 livre', categoria: 'Laboratorial', valorBase: 35.00 },
  { codigo: '31001018', descricao: 'Creatinina', categoria: 'Laboratorial', valorBase: 15.00 },
  { codigo: '31001019', descricao: 'Ureia', categoria: 'Laboratorial', valorBase: 15.00 },
  { codigo: '31001020', descricao: 'Ácido úrico', categoria: 'Laboratorial', valorBase: 18.00 },
  { codigo: '31001021', descricao: 'TGO/AST', categoria: 'Laboratorial', valorBase: 20.00 },
  { codigo: '31001022', descricao: 'TGP/ALT', categoria: 'Laboratorial', valorBase: 20.00 },
  { codigo: '31001023', descricao: 'Bilirrubina total', categoria: 'Laboratorial', valorBase: 18.00 },
  { codigo: '31001024', descricao: 'Urina tipo I', categoria: 'Laboratorial', valorBase: 12.00 },
  { codigo: '31001025', descricao: 'Urocultura', categoria: 'Laboratorial', valorBase: 30.00 },
  { codigo: '31001026', descricao: 'Teste de gravidez (Beta HCG)', categoria: 'Laboratorial', valorBase: 25.00 },
  { codigo: '31001027', descricao: 'PSA', categoria: 'Laboratorial', valorBase: 40.00 },
  { codigo: '31001028', descricao: 'Vitamina D', categoria: 'Laboratorial', valorBase: 60.00 },
  { codigo: '31001029', descricao: 'Vitamina B12', categoria: 'Laboratorial', valorBase: 50.00 },
  { codigo: '31001030', descricao: 'Ácido fólico', categoria: 'Laboratorial', valorBase: 45.00 },
  { codigo: '40301010', descricao: 'Raio-X de tórax PA', categoria: 'Imagem', valorBase: 80.00 },
  { codigo: '40301011', descricao: 'Raio-X de tórax perfil', categoria: 'Imagem', valorBase: 80.00 },
  { codigo: '40301012', descricao: 'Raio-X de abdome', categoria: 'Imagem', valorBase: 90.00 },
  { codigo: '40301013', descricao: 'Raio-X de coluna lombar', categoria: 'Imagem', valorBase: 100.00 },
  { codigo: '40301014', descricao: 'Raio-X de coluna cervical', categoria: 'Imagem', valorBase: 100.00 },
  { codigo: '40301015', descricao: 'Ultrassonografia de abdome total', categoria: 'Imagem', valorBase: 150.00 },
  { codigo: '40301016', descricao: 'Ultrassonografia de pelve', categoria: 'Imagem', valorBase: 120.00 },
  { codigo: '40301017', descricao: 'Ultrassonografia obstétrica', categoria: 'Imagem', valorBase: 180.00 },
  { codigo: '40301018', descricao: 'Ecocardiograma', categoria: 'Imagem', valorBase: 250.00 },
  { codigo: '40301019', descricao: 'Eletrocardiograma', categoria: 'Imagem', valorBase: 60.00 },
  { codigo: '40301020', descricao: 'Mamografia bilateral', categoria: 'Imagem', valorBase: 200.00 },
  { codigo: '40301021', descricao: 'Densitometria óssea', categoria: 'Imagem', valorBase: 180.00 },
  { codigo: '40301022', descricao: 'Tomografia de crânio', categoria: 'Imagem', valorBase: 400.00 },
  { codigo: '40301023', descricao: 'Tomografia de tórax', categoria: 'Imagem', valorBase: 450.00 },
  { codigo: '40301024', descricao: 'Ressonância magnética de crânio', categoria: 'Imagem', valorBase: 800.00 },
  { codigo: '40301025', descricao: 'Ressonância magnética de coluna', categoria: 'Imagem', valorBase: 900.00 },
  { codigo: '50001010', descricao: 'Curativo simples', categoria: 'Procedimento', valorBase: 25.00 },
  { codigo: '50001011', descricao: 'Curativo com medicação', categoria: 'Procedimento', valorBase: 35.00 },
  { codigo: '50001012', descricao: 'Retirada de pontos', categoria: 'Procedimento', valorBase: 40.00 },
  { codigo: '50001013', descricao: 'Aplicação de injeção intramuscular', categoria: 'Procedimento', valorBase: 15.00 },
  { codigo: '50001014', descricao: 'Aplicação de injeção subcutânea', categoria: 'Procedimento', valorBase: 15.00 },
  { codigo: '50001015', descricao: 'Aplicação de injeção intravenosa', categoria: 'Procedimento', valorBase: 20.00 },
  { codigo: '50001016', descricao: 'Nebulização', categoria: 'Procedimento', valorBase: 30.00 },
  { codigo: '50001017', descricao: 'Aferição de pressão arterial', categoria: 'Procedimento', valorBase: 10.00 },
  { codigo: '50001018', descricao: 'Aferição de glicemia capilar', categoria: 'Procedimento', valorBase: 8.00 },
  { codigo: '50001019', descricao: 'Eletrocardiograma com laudo', categoria: 'Procedimento', valorBase: 80.00 },
  { codigo: '50001020', descricao: 'Teste ergométrico', categoria: 'Procedimento', valorBase: 300.00 },
  { codigo: '50001021', descricao: 'Holter 24 horas', categoria: 'Procedimento', valorBase: 350.00 },
  { codigo: '50001022', descricao: 'MAPA 24 horas', categoria: 'Procedimento', valorBase: 380.00 },
  { codigo: '50001023', descricao: 'Espirometria', categoria: 'Procedimento', valorBase: 150.00 },
  { codigo: '50001024', descricao: 'Biópsia de pele', categoria: 'Procedimento', valorBase: 200.00 },
  { codigo: '50001025', descricao: 'Cauterização de verruga', categoria: 'Procedimento', valorBase: 120.00 },
  { codigo: '50001026', descricao: 'Remoção de corpo estranho', categoria: 'Procedimento', valorBase: 150.00 },
  { codigo: '50001027', descricao: 'Drenagem de abscesso', categoria: 'Procedimento', valorBase: 180.00 },
  { codigo: '50001028', descricao: 'Sutura simples', categoria: 'Procedimento', valorBase: 200.00 },
  { codigo: '50001029', descricao: 'Sutura complexa', categoria: 'Procedimento', valorBase: 350.00 },
  { codigo: '50001030', descricao: 'Punção venosa para coleta', categoria: 'Procedimento', valorBase: 25.00 },
];

export const tussService = {
  search: (query: string): ProcedimentoTUSS[] => {
    if (!query || query.length < 2) return [];
    const lowerQuery = query.toLowerCase();
    return tussTable.filter(p =>
      p.codigo.includes(query) ||
      p.descricao.toLowerCase().includes(lowerQuery) ||
      p.categoria.toLowerCase().includes(lowerQuery)
    ).slice(0, 20);
  },

  getByCode: (codigo: string): ProcedimentoTUSS | undefined => {
    return tussTable.find(p => p.codigo === codigo);
  },

  getAll: (): ProcedimentoTUSS[] => {
    return [...tussTable];
  }
};


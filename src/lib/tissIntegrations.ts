// Integrações TISS com outros módulos do sistema

import { GuiaTISS } from './tissService';

// Armazenamento de transações financeiras (mock - em produção viria de uma API)
let financialTransactions: Array<{
  id: number;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string;
  method: string;
  category: string;
  patient: string | null;
  reference?: string; // Referência à guia/lote
}> = [];

// Armazenamento de pagamentos (mock - em produção viria de uma API)
let payments: Array<{
  id: number;
  patient: string;
  patientId?: number;
  service: string;
  amount: number;
  totalAmount?: number;
  date: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  method: string;
  healthInsurance?: string;
  receiptNumber?: string;
  reference?: string; // Referência à guia/lote
}> = [];

export const tissIntegrations = {
  // Criar recebimento no Financeiro quando guia é paga
  criarRecebimentoFinanceiro: (guia: GuiaTISS) => {
    if (guia.status !== 'PAGA' || !guia.valorPago) return;

    const transactionId = financialTransactions.length > 0 
      ? Math.max(...financialTransactions.map(t => t.id)) + 1 
      : 1;

    const transaction = {
      id: transactionId,
      type: 'income' as const,
      description: `Convênio ${guia.convenioNome} - Guia ${guia.numeroGuia}`,
      amount: guia.valorPago,
      date: guia.dataPagamento || new Date().toISOString().split('T')[0],
      method: 'Convênio',
      category: 'Convênios TISS',
      patient: guia.pacienteNome,
      reference: `Guia ${guia.numeroGuia}`
    };

    financialTransactions.push(transaction);
    
    // Disparar evento para atualizar o módulo Financeiro
    window.dispatchEvent(new CustomEvent('tissRecebimentoCriado', { detail: transaction }));
    
    return transaction;
  },

  // Criar baixa automática no módulo Pagamentos quando guia é paga
  criarBaixaPagamento: (guia: GuiaTISS) => {
    if (guia.status !== 'PAGA' || !guia.valorPago) return;

    const paymentId = payments.length > 0 
      ? Math.max(...payments.map(p => p.id)) + 1 
      : 1;
    
    const receiptNumber = `REC-TISS-${new Date().getFullYear()}-${String(paymentId).padStart(4, '0')}`;

    const payment = {
      id: paymentId,
      patient: guia.pacienteNome,
      patientId: guia.pacienteId,
      service: `Guia TISS ${guia.numeroGuia}`,
      amount: guia.valorPago,
      totalAmount: guia.valorPago,
      date: guia.dataPagamento || new Date().toISOString().split('T')[0],
      dueDate: guia.dataPagamento || new Date().toISOString().split('T')[0],
      status: 'paid' as const,
      method: 'Convênio',
      healthInsurance: guia.convenioNome,
      receiptNumber: receiptNumber,
      reference: `Guia ${guia.numeroGuia} - Lote ${guia.loteId || 'N/A'}`
    };

    payments.push(payment);
    
    // Disparar evento para atualizar o módulo Pagamentos
    window.dispatchEvent(new CustomEvent('tissPagamentoCriado', { detail: payment }));
    
    return payment;
  },

  // Obter transações financeiras criadas pelo TISS
  getFinancialTransactions: () => {
    return [...financialTransactions];
  },

  // Obter pagamentos criados pelo TISS
  getPayments: () => {
    return [...payments];
  },

  // Processar múltiplas guias pagas (quando retorno é processado)
  processarGuiasPagas: (guias: GuiaTISS[]) => {
    const recebimentos: any[] = [];
    const pagamentos: any[] = [];

    guias.forEach(guia => {
      if (guia.status === 'PAGA' && guia.valorPago) {
        const recebimento = tissIntegrations.criarRecebimentoFinanceiro(guia);
        const pagamento = tissIntegrations.criarBaixaPagamento(guia);
        
        if (recebimento) recebimentos.push(recebimento);
        if (pagamento) pagamentos.push(pagamento);
      }
    });

    return { recebimentos, pagamentos };
  }
};


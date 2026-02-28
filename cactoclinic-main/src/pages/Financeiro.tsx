import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  Filter,
  Search,
  PieChart,
  BarChart3,
  LineChart,
  Wallet,
  Receipt,
  Activity,
  Target,
  FileText
} from "lucide-react";
import {
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import jsPDF from 'jspdf';

const Financeiro = () => {
  const [periodFilter, setPeriodFilter] = useState("month");
  const [searchTerm, setSearchTerm] = useState("");
  const [transactionFilter, setTransactionFilter] = useState("all");
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv">("pdf");
  const [tissTransactions, setTissTransactions] = useState<any[]>([]);

  // Dados de evolução financeira
  const financialEvolution = useMemo(() => {
    if (periodFilter === "year") {
      return [
        { month: "Jan", receitas: 42000, despesas: 16500, saldo: 25500 },
        { month: "Fev", receitas: 48500, despesas: 17200, saldo: 31300 },
        { month: "Mar", receitas: 45200, despesas: 16800, saldo: 28400 },
        { month: "Abr", receitas: 52100, despesas: 17500, saldo: 34600 },
        { month: "Mai", receitas: 48750, despesas: 18320, saldo: 30430 },
        { month: "Jun", receitas: 53200, despesas: 19000, saldo: 34200 },
        { month: "Jul", receitas: 56100, despesas: 19500, saldo: 36600 },
        { month: "Ago", receitas: 54800, despesas: 18800, saldo: 36000 },
        { month: "Set", receitas: 57200, despesas: 19200, saldo: 38000 },
        { month: "Out", receitas: 58900, despesas: 19800, saldo: 39100 },
        { month: "Nov", receitas: 61200, despesas: 20100, saldo: 41100 },
        { month: "Dez", receitas: 63500, despesas: 20500, saldo: 43000 },
      ];
    }
    return [
      { day: "01", receitas: 1850, despesas: 620, saldo: 1230 },
      { day: "05", receitas: 2100, despesas: 850, saldo: 1250 },
      { day: "10", receitas: 1950, despesas: 3500, saldo: -1550 },
      { day: "15", receitas: 2400, despesas: 920, saldo: 1480 },
      { day: "20", receitas: 2200, despesas: 680, saldo: 1520 },
      { day: "25", receitas: 2600, despesas: 750, saldo: 1850 },
      { day: "30", receitas: 2800, despesas: 800, saldo: 2000 },
    ];
  }, [periodFilter]);

  // Gerar transações com datas dinâmicas baseadas na data atual
  const generateTransactions = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();
    
    const formatDate = (year: number, month: number, day: number) => {
      const date = new Date(year, month, day);
      return date.toISOString().split('T')[0];
    };

    return [
      // Transações recentes (últimos dias)
      { id: 1, type: "income" as const, description: "Consulta - Maria Silva", amount: 250.00, date: formatDate(currentYear, currentMonth, currentDate - 2), method: "Cartão", category: "Consultas", patient: "Maria Silva" },
      { id: 2, type: "income" as const, description: "Retorno - Pedro Costa", amount: 150.00, date: formatDate(currentYear, currentMonth, currentDate - 2), method: "Dinheiro", category: "Retornos", patient: "Pedro Costa" },
      { id: 3, type: "expense" as const, description: "Fornecedor - Materiais", amount: 850.00, date: formatDate(currentYear, currentMonth, currentDate - 3), method: "Transferência", category: "Materiais", patient: null },
      { id: 4, type: "income" as const, description: "Consulta - Julia Oliveira", amount: 300.00, date: formatDate(currentYear, currentMonth, currentDate - 3), method: "PIX", category: "Consultas", patient: "Julia Oliveira" },
      { id: 5, type: "expense" as const, description: "Aluguel da Clínica", amount: 3500.00, date: formatDate(currentYear, currentMonth, Math.max(1, currentDate - 7)), method: "Transferência", category: "Aluguel", patient: null },
      { id: 6, type: "income" as const, description: "Procedimento Estético - Ana Paula", amount: 1200.00, date: formatDate(currentYear, currentMonth, currentDate - 4), method: "Cartão", category: "Procedimentos", patient: "Ana Paula" },
      { id: 7, type: "expense" as const, description: "Salário - Equipe", amount: 6200.00, date: formatDate(currentYear, currentMonth, Math.max(1, currentDate - 22)), method: "Transferência", category: "Salários", patient: null },
      { id: 8, type: "income" as const, description: "Consulta - Roberto Alves", amount: 280.00, date: formatDate(currentYear, currentMonth, currentDate - 5), method: "PIX", category: "Consultas", patient: "Roberto Alves" },
      { id: 9, type: "income" as const, description: "Exame Laboratorial - Carlos Mendes", amount: 450.00, date: formatDate(currentYear, currentMonth, currentDate - 1), method: "PIX", category: "Exames", patient: "Carlos Mendes" },
      { id: 10, type: "income" as const, description: "Consulta - Fernanda Martins", amount: 275.00, date: formatDate(currentYear, currentMonth, currentDate - 1), method: "Cartão", category: "Consultas", patient: "Fernanda Martins" },
      { id: 11, type: "expense" as const, description: "Conta de Energia", amount: 380.00, date: formatDate(currentYear, currentMonth, Math.max(1, currentDate - 6)), method: "Transferência", category: "Utilidades", patient: null },
      { id: 12, type: "income" as const, description: "Retorno - Lucas Santos", amount: 180.00, date: formatDate(currentYear, currentMonth, currentDate), method: "Dinheiro", category: "Retornos", patient: "Lucas Santos" },
      { id: 13, type: "expense" as const, description: "Conta de Água", amount: 220.00, date: formatDate(currentYear, currentMonth, Math.max(1, currentDate - 8)), method: "Transferência", category: "Utilidades", patient: null },
      { id: 14, type: "income" as const, description: "Procedimento Estético - Patricia Lima", amount: 1500.00, date: formatDate(currentYear, currentMonth, currentDate - 1), method: "Cartão", category: "Procedimentos", patient: "Patricia Lima" },
      { id: 15, type: "income" as const, description: "Consulta - Rafael Souza", amount: 320.00, date: formatDate(currentYear, currentMonth, currentDate), method: "PIX", category: "Consultas", patient: "Rafael Souza" },
      { id: 16, type: "expense" as const, description: "Internet e Telefone", amount: 180.00, date: formatDate(currentYear, currentMonth, Math.max(1, currentDate - 9)), method: "Transferência", category: "Utilidades", patient: null },
      { id: 17, type: "income" as const, description: "Exame de Imagem - Beatriz Costa", amount: 680.00, date: formatDate(currentYear, currentMonth, currentDate - 1), method: "Cartão", category: "Exames", patient: "Beatriz Costa" },
      { id: 18, type: "income" as const, description: "Consulta - Gabriel Almeida", amount: 290.00, date: formatDate(currentYear, currentMonth, currentDate - 1), method: "PIX", category: "Consultas", patient: "Gabriel Almeida" },
      { id: 19, type: "expense" as const, description: "Material de Escritório", amount: 450.00, date: formatDate(currentYear, currentMonth, Math.max(1, currentDate - 10)), method: "Transferência", category: "Materiais", patient: null },
      { id: 20, type: "income" as const, description: "Retorno - Mariana Rocha", amount: 160.00, date: formatDate(currentYear, currentMonth, currentDate), method: "Dinheiro", category: "Retornos", patient: "Mariana Rocha" },
      { id: 21, type: "income" as const, description: "Procedimento Estético - João Silva", amount: 1350.00, date: formatDate(currentYear, currentMonth, currentDate - 2), method: "Cartão", category: "Procedimentos", patient: "João Silva" },
      { id: 22, type: "expense" as const, description: "Manutenção de Equipamentos", amount: 1200.00, date: formatDate(currentYear, currentMonth, Math.max(1, currentDate - 11)), method: "Transferência", category: "Manutenção", patient: null },
      { id: 23, type: "income" as const, description: "Consulta - Larissa Ferreira", amount: 310.00, date: formatDate(currentYear, currentMonth, currentDate - 1), method: "PIX", category: "Consultas", patient: "Larissa Ferreira" },
      { id: 24, type: "income" as const, description: "Exame Cardiológico - Thiago Oliveira", amount: 550.00, date: formatDate(currentYear, currentMonth, currentDate - 3), method: "Cartão", category: "Exames", patient: "Thiago Oliveira" },
      { id: 25, type: "expense" as const, description: "Seguro da Clínica", amount: 890.00, date: formatDate(currentYear, currentMonth, Math.max(1, currentDate - 23)), method: "Transferência", category: "Seguros", patient: null },
      { id: 26, type: "income" as const, description: "Retorno - Camila Rodrigues", amount: 170.00, date: formatDate(currentYear, currentMonth, currentDate - 2), method: "Dinheiro", category: "Retornos", patient: "Camila Rodrigues" },
      { id: 27, type: "income" as const, description: "Consulta - Bruno Pereira", amount: 265.00, date: formatDate(currentYear, currentMonth, currentDate - 1), method: "PIX", category: "Consultas", patient: "Bruno Pereira" },
      { id: 28, type: "expense" as const, description: "Marketing Digital", amount: 650.00, date: formatDate(currentYear, currentMonth, Math.max(1, currentDate - 24)), method: "Transferência", category: "Marketing", patient: null },
      { id: 29, type: "income" as const, description: "Procedimento Estético - Vanessa Santos", amount: 1100.00, date: formatDate(currentYear, currentMonth, currentDate - 2), method: "Cartão", category: "Procedimentos", patient: "Vanessa Santos" },
      { id: 30, type: "income" as const, description: "Consulta - Diego Martins", amount: 285.00, date: formatDate(currentYear, currentMonth, currentDate - 1), method: "PIX", category: "Consultas", patient: "Diego Martins" },
    ];
  };


  // Análise de formas de pagamento
  const paymentMethods = [
    { name: "PIX", amount: 18250, percentage: 37, color: "#10b77f" },
    { name: "Cartão", amount: 15200, percentage: 31, color: "#3b82f6" },
    { name: "Dinheiro", amount: 9800, percentage: 20, color: "#f59e0b" },
    { name: "Convênio", amount: 5500, percentage: 12, color: "#8b5cf6" },
  ];

  // Análise de lucratividade por procedimento
  const procedureProfitability = [
    { procedure: "Consulta Geral", revenue: 28450, cost: 8500, profit: 19950, margin: 70.2 },
    { procedure: "Procedimentos Estéticos", revenue: 15200, cost: 4500, profit: 10700, margin: 70.4 },
    { procedure: "Retornos", revenue: 5100, cost: 1200, profit: 3900, margin: 76.5 },
    { procedure: "Exames", revenue: 8900, cost: 3200, profit: 5700, margin: 64.0 },
  ];

  const recentTransactions = useMemo(() => {
    return generateTransactions().sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, []);

  // Filtrar transações por período
  const getFilteredTransactionsByPeriod = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (periodFilter) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        const dayOfWeek = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return recentTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= now;
    });
  }, [periodFilter, recentTransactions]);

  const pendingPayments = [
    { id: 1, patient: "Carlos Santos", amount: 250.00, dueDate: "2024-01-20", days: 5, status: "pending" as const, procedure: "Consulta" },
    { id: 2, patient: "Ana Lima", amount: 450.00, dueDate: "2024-01-18", days: 3, status: "pending" as const, procedure: "Procedimento" },
    { id: 3, patient: "Roberto Silva", amount: 180.00, dueDate: "2024-01-16", days: 1, status: "overdue" as const, procedure: "Retorno" },
    { id: 4, patient: "Fernanda Martins", amount: 320.00, dueDate: "2024-01-17", days: 2, status: "pending" as const, procedure: "Consulta" },
  ];

  const accountsPayable = [
    { id: 1, supplier: "Fornecedor ABC", description: "Materiais Médicos", amount: 1250.00, dueDate: "2024-01-25", days: 10, category: "Materiais" },
    { id: 2, supplier: "Imobiliária XYZ", description: "Aluguel", amount: 3500.00, dueDate: "2024-01-10", days: -5, category: "Aluguel" },
    { id: 3, supplier: "Energia Elétrica", description: "Conta de Luz", amount: 450.00, dueDate: "2024-01-22", days: 7, category: "Utilidades" },
    { id: 4, supplier: "Água e Esgoto", description: "Conta de Água", amount: 280.00, dueDate: "2024-01-20", days: 5, category: "Utilidades" },
  ];

  // Calcular valores filtrados por período
  const filteredStats = useMemo(() => {
    const filtered = getFilteredTransactionsByPeriod;
    const receitas = filtered.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const despesas = filtered.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    const saldo = receitas - despesas;
    const aReceber = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

    return { receitas, despesas, saldo, aReceber };
  }, [getFilteredTransactionsByPeriod, pendingPayments]);

  // Filtros
  const filteredTransactions = useMemo(() => {
    let filtered = getFilteredTransactionsByPeriod;

    if (transactionFilter === "income") {
      filtered = filtered.filter(t => t.type === "income");
    } else if (transactionFilter === "expense") {
      filtered = filtered.filter(t => t.type === "expense");
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchLower) ||
        (t.patient && t.patient.toLowerCase().includes(searchLower)) ||
        t.category.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [transactionFilter, searchTerm, getFilteredTransactionsByPeriod]);

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Função auxiliar para adicionar texto
      const addText = (text: string, fontSize: number, isBold: boolean = false, color: number[] = [0, 0, 0], align: 'left' | 'center' | 'right' = 'left') => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setTextColor(color[0], color[1], color[2]);
        
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line: string) => {
          const xPosition = align === 'center' ? pageWidth / 2 : align === 'right' ? pageWidth - margin : margin;
          doc.text(line, xPosition, yPosition, { align });
          yPosition += fontSize * 0.5;
        });
        yPosition += 5;
      };

      // Cabeçalho
      addText('RELATÓRIO FINANCEIRO COMPLETO', 18, true, [21, 128, 61], 'center');
      addText(`Período: ${periodFilter === "today" ? "Hoje" : periodFilter === "week" ? "Esta Semana" : periodFilter === "month" ? "Este Mês" : "Este Ano"}`, 12, false, [100, 100, 100], 'center');
      addText(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 10, false, [150, 150, 150], 'center');
      yPosition += 10;

      // Linha divisória
      doc.setDrawColor(21, 128, 61);
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Resumo Financeiro
      addText('RESUMO FINANCEIRO', 14, true);
      addText(`Receitas: R$ ${filteredStats.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 11, false);
      addText(`Despesas: R$ ${filteredStats.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 11, false);
      addText(`Saldo Líquido: R$ ${filteredStats.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 11, true);
      addText(`À Receber: R$ ${filteredStats.aReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 11, false);
      addText(`Total de Transações: ${filteredTransactions.length}`, 11, false);
      yPosition += 10;

      // Análise por Categoria - Receitas
      const receitasPorCategoria = filteredTransactions
        .filter(t => t.type === "income")
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>);

      if (Object.keys(receitasPorCategoria).length > 0) {
        if (yPosition > 240) {
          doc.addPage();
          yPosition = margin;
        }
        addText('RECEITAS POR CATEGORIA', 14, true);
        Object.entries(receitasPorCategoria).forEach(([category, amount]) => {
          addText(`${category}: R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 10, false);
        });
        yPosition += 5;
      }

      // Análise por Categoria - Despesas
      const despesasPorCategoria = filteredTransactions
        .filter(t => t.type === "expense")
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>);

      if (Object.keys(despesasPorCategoria).length > 0) {
        if (yPosition > 240) {
          doc.addPage();
          yPosition = margin;
        }
        addText('DESPESAS POR CATEGORIA', 14, true);
        Object.entries(despesasPorCategoria).forEach(([category, amount]) => {
          addText(`${category}: R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 10, false);
        });
        yPosition += 10;
      }

      // Todas as Transações
      if (filteredTransactions.length > 0) {
        if (yPosition > 240) {
          doc.addPage();
          yPosition = margin;
        }
        addText('MOVIMENTAÇÕES FINANCEIRAS', 14, true);
        
        filteredTransactions.forEach((transaction, index) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = margin;
          }
          
          const typeText = transaction.type === "income" ? "Receita" : "Despesa";
          const amountText = `${transaction.type === "income" ? "+" : "-"}R$ ${transaction.amount.toFixed(2)}`;
          
          addText(`${index + 1}. ${transaction.description}`, 10, true);
          addText(`   Tipo: ${typeText} | Categoria: ${transaction.category} | Método: ${transaction.method}`, 9, false, [100, 100, 100]);
          addText(`   Data: ${new Date(transaction.date).toLocaleDateString('pt-BR')} | Valor: ${amountText}${transaction.patient ? ` | Paciente: ${transaction.patient}` : ''}`, 9, false, [100, 100, 100]);
          yPosition += 3;
        });
      }

      // Contas a Receber
      if (pendingPayments.length > 0) {
        yPosition += 5;
        if (yPosition > 240) {
          doc.addPage();
          yPosition = margin;
        }
        addText('CONTAS A RECEBER', 14, true);
        pendingPayments.forEach((payment, index) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = margin;
          }
          addText(`${index + 1}. ${payment.patient} - R$ ${payment.amount.toFixed(2)}`, 10, false);
          addText(`   Procedimento: ${payment.procedure} | Vencimento: ${new Date(payment.dueDate).toLocaleDateString('pt-BR')} | Status: ${payment.status === "overdue" ? "Vencido" : "Pendente"}`, 9, false, [100, 100, 100]);
          yPosition += 3;
        });
      }

      // Contas a Pagar
      if (accountsPayable.length > 0) {
        yPosition += 5;
        if (yPosition > 240) {
          doc.addPage();
          yPosition = margin;
        }
        addText('CONTAS A PAGAR', 14, true);
        accountsPayable.forEach((account, index) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = margin;
          }
          addText(`${index + 1}. ${account.supplier} - R$ ${account.amount.toFixed(2)}`, 10, false);
          addText(`   ${account.description} | Categoria: ${account.category} | Vencimento: ${new Date(account.dueDate).toLocaleDateString('pt-BR')}`, 9, false, [100, 100, 100]);
          yPosition += 3;
        });
      }

      // Análise de Formas de Pagamento
      const formasPagamento = filteredTransactions
        .filter(t => t.type === "income")
        .reduce((acc, t) => {
          acc[t.method] = (acc[t.method] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>);

      if (Object.keys(formasPagamento).length > 0) {
        yPosition += 5;
        if (yPosition > 240) {
          doc.addPage();
          yPosition = margin;
        }
        addText('ANÁLISE DE FORMAS DE PAGAMENTO', 14, true);
        const totalReceitas = Object.values(formasPagamento).reduce((sum, val) => sum + val, 0);
        Object.entries(formasPagamento).forEach(([method, amount]) => {
          const percentage = ((amount / totalReceitas) * 100).toFixed(1);
          addText(`${method}: R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${percentage}%)`, 10, false);
        });
      }

      // Rodapé
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const footerText = `Documento gerado em ${new Date().toLocaleString('pt-BR')} - CactoSaude - Sistema de Gestão Financeira`;
      doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: 'center' });

      // Salvar PDF
      const periodText = periodFilter === "today" ? "hoje" : periodFilter === "week" ? "semana" : periodFilter === "month" ? "mes" : "ano";
      const fileName = `relatorio_financeiro_${periodText}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast.success("Relatório PDF exportado com sucesso!");
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error("Erro ao gerar relatório PDF. Tente novamente.");
    }
  };

  const handleExportCSV = () => {
    try {
      const periodText = periodFilter === "today" ? "Hoje" : periodFilter === "week" ? "Esta Semana" : periodFilter === "month" ? "Este Mês" : "Este Ano";
      
      // Criar conteúdo CSV
      let csvContent = '\uFEFF'; // BOM para UTF-8
      
      // Cabeçalho do relatório
      csvContent += `RELATÓRIO FINANCEIRO COMPLETO\n`;
      csvContent += `Período: ${periodText}\n`;
      csvContent += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n\n`;
      
      // Resumo Financeiro
      csvContent += `RESUMO FINANCEIRO\n`;
      csvContent += `Receitas,R$ ${filteredStats.receitas.toFixed(2)}\n`;
      csvContent += `Despesas,R$ ${filteredStats.despesas.toFixed(2)}\n`;
      csvContent += `Saldo Líquido,R$ ${filteredStats.saldo.toFixed(2)}\n`;
      csvContent += `À Receber,R$ ${filteredStats.aReceber.toFixed(2)}\n`;
      csvContent += `Total de Transações,${filteredTransactions.length}\n\n`;
      
      // Movimentações Financeiras
      csvContent += `MOVIMENTAÇÕES FINANCEIRAS\n`;
      csvContent += `Data,Tipo,Descrição,Categoria,Método de Pagamento,Paciente,Valor\n`;
      filteredTransactions.forEach(transaction => {
        const date = new Date(transaction.date).toLocaleDateString('pt-BR');
        const type = transaction.type === "income" ? "Receita" : "Despesa";
        const value = transaction.type === "income" ? `+R$ ${transaction.amount.toFixed(2)}` : `-R$ ${transaction.amount.toFixed(2)}`;
        const patient = transaction.patient || '';
        csvContent += `${date},${type},"${transaction.description}",${transaction.category},${transaction.method},"${patient}",${value}\n`;
      });
      
      csvContent += `\n`;
      
      // Contas a Receber
      csvContent += `CONTAS A RECEBER\n`;
      csvContent += `Paciente,Procedimento,Valor,Data de Vencimento,Status,Dias\n`;
      pendingPayments.forEach(payment => {
        const dueDate = new Date(payment.dueDate).toLocaleDateString('pt-BR');
        const status = payment.status === "overdue" ? "Vencido" : "Pendente";
        csvContent += `"${payment.patient}",${payment.procedure},R$ ${payment.amount.toFixed(2)},${dueDate},${status},${payment.days}\n`;
      });
      
      csvContent += `\n`;
      
      // Contas a Pagar
      csvContent += `CONTAS A PAGAR\n`;
      csvContent += `Fornecedor,Descrição,Categoria,Valor,Data de Vencimento,Dias\n`;
      accountsPayable.forEach(account => {
        const dueDate = new Date(account.dueDate).toLocaleDateString('pt-BR');
        csvContent += `"${account.supplier}","${account.description}",${account.category},R$ ${account.amount.toFixed(2)},${dueDate},${account.days}\n`;
      });
      
      csvContent += `\n`;
      
      // Análise por Categoria - Receitas
      const receitasPorCategoria = filteredTransactions
        .filter(t => t.type === "income")
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>);
      
      if (Object.keys(receitasPorCategoria).length > 0) {
        csvContent += `RECEITAS POR CATEGORIA\n`;
        csvContent += `Categoria,Valor\n`;
        Object.entries(receitasPorCategoria).forEach(([category, amount]) => {
          csvContent += `${category},R$ ${amount.toFixed(2)}\n`;
        });
        csvContent += `\n`;
      }
      
      // Análise por Categoria - Despesas
      const despesasPorCategoria = filteredTransactions
        .filter(t => t.type === "expense")
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>);
      
      if (Object.keys(despesasPorCategoria).length > 0) {
        csvContent += `DESPESAS POR CATEGORIA\n`;
        csvContent += `Categoria,Valor\n`;
        Object.entries(despesasPorCategoria).forEach(([category, amount]) => {
          csvContent += `${category},R$ ${amount.toFixed(2)}\n`;
        });
        csvContent += `\n`;
      }
      
      // Análise de Formas de Pagamento
      const formasPagamento = filteredTransactions
        .filter(t => t.type === "income")
        .reduce((acc, t) => {
          acc[t.method] = (acc[t.method] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>);
      
      if (Object.keys(formasPagamento).length > 0) {
        csvContent += `ANÁLISE DE FORMAS DE PAGAMENTO\n`;
        csvContent += `Forma de Pagamento,Valor,Percentual\n`;
        const totalReceitas = Object.values(formasPagamento).reduce((sum, val) => sum + val, 0);
        Object.entries(formasPagamento).forEach(([method, amount]) => {
          const percentage = ((amount / totalReceitas) * 100).toFixed(2);
          csvContent += `${method},R$ ${amount.toFixed(2)},${percentage}%\n`;
        });
      }
      
      // Criar blob e fazer download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      const periodTextFile = periodFilter === "today" ? "hoje" : periodFilter === "week" ? "semana" : periodFilter === "month" ? "mes" : "ano";
      link.setAttribute('download', `relatorio_financeiro_${periodTextFile}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Planilha CSV exportada com sucesso!");
    } catch (error) {
      console.error('Erro ao gerar CSV:', error);
      toast.error("Erro ao gerar planilha CSV. Tente novamente.");
    }
  };

  const handleExportReport = () => {
    if (exportFormat === "pdf") {
      handleExportPDF();
    } else {
      handleExportCSV();
    }
  };

  return (
    <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-2 sm:gap-3">
          <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0 mt-1" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Financeiro</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Controle financeiro completo da clínica
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">Esta Semana</SelectItem>
            <SelectItem value="month">Este Mês</SelectItem>
            <SelectItem value="year">Este Ano</SelectItem>
          </SelectContent>
        </Select>
          <Select value={exportFormat} onValueChange={(value: "pdf" | "csv") => setExportFormat(value)}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <FileText className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="csv">Planilha</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Receitas
              <TrendingUp className="h-4 w-4 text-success" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              R$ {filteredStats.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {getFilteredTransactionsByPeriod.filter(t => t.type === "income").length} transação(ões)
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Despesas
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              R$ {filteredStats.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {getFilteredTransactionsByPeriod.filter(t => t.type === "expense").length} transação(ões)
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Saldo Líquido
              <DollarSign className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${filteredStats.saldo >= 0 ? 'text-primary' : 'text-destructive'}`}>
              R$ {filteredStats.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredStats.saldo >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              À Receber
              <AlertCircle className="h-4 w-4 text-warning" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              R$ {filteredStats.aReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingPayments.length} pagamento(s) pendente(s)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Evolução Financeira */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Evolução Financeira
              </CardTitle>
              <CardDescription>
                Receitas, despesas e saldo líquido ao longo do tempo
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={financialEvolution}>
              <defs>
                <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b77f" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b77f" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey={periodFilter === "year" ? "month" : "day"} className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
              />
              <Legend />
              <Area type="monotone" dataKey="receitas" stroke="#10b77f" fillOpacity={1} fill="url(#colorReceitas)" name="Receitas" />
              <Area type="monotone" dataKey="despesas" stroke="#ef4444" fillOpacity={1} fill="url(#colorDespesas)" name="Despesas" />
              <Line type="monotone" dataKey="saldo" stroke="#3b82f6" strokeWidth={2} name="Saldo Líquido" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Movimentações Recentes com Filtros */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
            <CardTitle>Movimentações Recentes</CardTitle>
            <CardDescription>Últimas transações financeiras</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={transactionFilter} onValueChange={setTransactionFilter}>
                  <SelectTrigger className="w-[120px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="income">Receitas</SelectItem>
                    <SelectItem value="expense">Despesas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar transação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma transação encontrada</p>
                  </div>
                ) : (
                  filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div
                      className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full shrink-0 ${
                        transaction.type === "income"
                          ? "bg-success/10"
                          : "bg-destructive/10"
                      }`}
                    >
                      {transaction.type === "income" ? (
                        <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base truncate">{transaction.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString("pt-BR")} • {transaction.method}
                      </p>
                            <Badge variant="outline" className="text-xs">
                              {transaction.category}
                            </Badge>
                          </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <p
                      className={`font-semibold text-sm sm:text-base ${
                        transaction.type === "income" ? "text-success" : "text-destructive"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}R$ {transaction.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
                  ))
                )}
            </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Pagamentos Pendentes e Contas a Pagar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Contas a Receber e Pagar
            </CardTitle>
            <CardDescription>Valores pendentes</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="receber" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="receber">
                  <Wallet className="h-4 w-4 mr-2" />
                  A Receber
                </TabsTrigger>
                <TabsTrigger value="pagar">
                  <Receipt className="h-4 w-4 mr-2" />
                  A Pagar
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="receber" className="mt-4">
                <ScrollArea className="h-[350px]">
                  <div className="space-y-3">
              {pendingPayments.map((payment) => (
                <div
                  key={payment.id}
                        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-3 rounded-lg border ${
                          payment.status === "overdue"
                            ? "border-destructive/30 bg-destructive/5"
                            : "border-warning/20 bg-warning/5"
                        }`}
                >
                  <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                    <p className="font-medium text-sm sm:text-base truncate">{payment.patient}</p>
                            <Badge variant={payment.status === "overdue" ? "destructive" : "warning"} className="text-xs">
                              {payment.status === "overdue" ? "Vencido" : "Pendente"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Vencimento: {new Date(payment.dueDate).toLocaleDateString("pt-BR")}
                    </p>
                            <Badge variant="outline" className="text-xs">
                              {payment.procedure}
                            </Badge>
                          </div>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <p className="font-semibold text-warning text-sm sm:text-base">
                      R$ {payment.amount.toFixed(2)}
                    </p>
                          <p className={`text-xs ${payment.status === "overdue" ? "text-destructive" : "text-muted-foreground"}`}>
                            {payment.days < 0 ? `${Math.abs(payment.days)} dias atrasado` : `${payment.days} ${payment.days === 1 ? "dia" : "dias"}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="pagar" className="mt-4">
                <ScrollArea className="h-[350px]">
                  <div className="space-y-3">
                    {accountsPayable.map((account) => (
                      <div
                        key={account.id}
                        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-3 rounded-lg border ${
                          account.days < 0
                            ? "border-destructive/30 bg-destructive/5"
                            : account.days <= 3
                            ? "border-warning/30 bg-warning/5"
                            : "border-muted/30 bg-muted/5"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm sm:text-base truncate">{account.supplier}</p>
                            <Badge variant={account.days < 0 ? "destructive" : account.days <= 3 ? "warning" : "outline"} className="text-xs">
                              {account.days < 0 ? "Vencido" : account.days <= 3 ? "Próximo" : "A vencer"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {account.description} • Vencimento: {new Date(account.dueDate).toLocaleDateString("pt-BR")}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {account.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-left sm:text-right shrink-0">
                          <p className="font-semibold text-destructive text-sm sm:text-base">
                            R$ {account.amount.toFixed(2)}
                          </p>
                          <p className={`text-xs ${account.days < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                            {account.days < 0 ? `${Math.abs(account.days)} dias atrasado` : `${account.days} ${account.days === 1 ? "dia" : "dias"}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Análises e Relatórios */}
      <Tabs defaultValue="analises" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="analises">Análises</TabsTrigger>
          <TabsTrigger value="formas-pagamento">Formas de Pagamento</TabsTrigger>
          <TabsTrigger value="lucratividade">Lucratividade</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
        </TabsList>

        {/* Análises Gerais */}
        <TabsContent value="analises" className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Gráfico de Receitas por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Receitas por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { category: "Consultas", amount: 28450 },
                    { category: "Procedimentos", amount: 15200 },
                    { category: "Retornos", amount: 5100 },
                    { category: "Exames", amount: 8900 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="category" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                    />
                    <Bar dataKey="amount" fill="#10b77f" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Despesas por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Despesas por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { category: "Aluguel", amount: 8500 },
                    { category: "Salários", amount: 6200 },
                    { category: "Materiais", amount: 2420 },
                    { category: "Utilidades", amount: 1200 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="category" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                    />
                    <Bar dataKey="amount" fill="#ef4444" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Resumo de Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Indicadores de Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Margem de Lucro</span>
                    <Target className="h-4 w-4 text-success" />
                  </div>
                  <div className="text-2xl font-bold text-success">62.4%</div>
                  <p className="text-xs text-muted-foreground mt-1">Excelente performance</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Ticket Médio</span>
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-primary">R$ 285,00</div>
                  <p className="text-xs text-muted-foreground mt-1">Por consulta/procedimento</p>
                </div>
                <div className="p-4 rounded-lg bg-info/10 border border-info/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Taxa de Inadimplência</span>
                    <AlertCircle className="h-4 w-4 text-info" />
                  </div>
                  <div className="text-2xl font-bold text-info">3.2%</div>
                  <p className="text-xs text-muted-foreground mt-1">R$ 5.880 em aberto</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Formas de Pagamento */}
        <TabsContent value="formas-pagamento" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribuição por Forma de Pagamento
                </CardTitle>
                <CardDescription>Análise das formas de pagamento utilizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={paymentMethods}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {paymentMethods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`} />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {paymentMethods.map((method) => (
                    <div key={method.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: method.color }} />
                        <span className="font-medium">{method.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">R$ {method.amount.toLocaleString('pt-BR')}</p>
                        <p className="text-xs text-muted-foreground">{method.percentage}% do total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Comparativo de Formas de Pagamento
                </CardTitle>
                <CardDescription>Evolução mensal por método</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { month: "Jan", PIX: 12000, Cartão: 15000, Dinheiro: 8000, Convênio: 7000 },
                    { month: "Fev", PIX: 15000, Cartão: 18000, Dinheiro: 9500, Convênio: 6000 },
                    { month: "Mar", PIX: 18250, Cartão: 15200, Dinheiro: 9800, Convênio: 5500 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                    />
                    <Legend />
                    <Bar dataKey="PIX" fill="#10b77f" name="PIX" />
                    <Bar dataKey="Cartão" fill="#3b82f6" name="Cartão" />
                    <Bar dataKey="Dinheiro" fill="#f59e0b" name="Dinheiro" />
                    <Bar dataKey="Convênio" fill="#8b5cf6" name="Convênio" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Lucratividade por Procedimento */}
        <TabsContent value="lucratividade" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Análise de Lucratividade por Procedimento
              </CardTitle>
              <CardDescription>Receita, custos e margem de lucro por tipo de procedimento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {procedureProfitability.map((item) => (
                  <div key={item.procedure} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{item.procedure}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>Receita: R$ {item.revenue.toLocaleString('pt-BR')}</span>
                          <span>•</span>
                          <span>Custos: R$ {item.cost.toLocaleString('pt-BR')}</span>
                          <span>•</span>
                          <span className="font-semibold text-success">Lucro: R$ {item.profit.toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-success border-success">
                          {item.margin.toFixed(1)}% margem
                        </Badge>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-success"
                        style={{ width: `${item.margin}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categorias Detalhadas */}
        <TabsContent value="categorias" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Receitas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { category: "Consultas", amount: 28450, percentage: 58, count: 156 },
                    { category: "Procedimentos", amount: 15200, percentage: 31, count: 64 },
                    { category: "Retornos", amount: 5100, percentage: 11, count: 89 },
                  ].map((item) => (
                    <div key={item.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{item.category}</span>
                          <p className="text-xs text-muted-foreground">{item.count} procedimentos</p>
                        </div>
                        <span className="font-semibold text-success">R$ {item.amount.toLocaleString("pt-BR")}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-success"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          <Card>
            <CardHeader>
              <CardTitle>Despesas por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { category: "Aluguel", amount: 8500, percentage: 46 },
                  { category: "Salários", amount: 6200, percentage: 34 },
                  { category: "Materiais", amount: 2420, percentage: 13 },
                  { category: "Outros", amount: 1200, percentage: 7 },
                ].map((item) => (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.category}</span>
                      <span className="font-semibold text-destructive">R$ {item.amount.toLocaleString("pt-BR")}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-destructive"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Financeiro;

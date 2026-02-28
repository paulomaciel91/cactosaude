import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Calendar, Users, DollarSign, TrendingUp, Activity, Clock, FileText, Eye, Building2 } from "lucide-react";
import { toast } from "sonner";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart as RechartsPie, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { appointmentService, Appointment } from "@/lib/appointmentService";
import jsPDF from 'jspdf';

interface ReportHistory {
  id: string;
  name: string;
  date: string;
  size: string;
  type: string;
  data?: any;
}

const Relatorios = () => {
  const [periodFilter, setPeriodFilter] = useState("month");
  const [reportHistory, setReportHistory] = useState<ReportHistory[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [viewingReport, setViewingReport] = useState<ReportHistory | null>(null);
  const [guiasTISS, setGuiasTISS] = useState<GuiaTISS[]>([]);
  const [lotesTISS, setLotesTISS] = useState<LoteFaturamento[]>([]);
  const [glosasTISS, setGlosasTISS] = useState<Glosa[]>([]);

  // Carregar agendamentos
  useEffect(() => {
    const loadAppointments = () => {
      setAppointments(appointmentService.getAllAppointments());
    };
    loadAppointments();
    const unsubscribe = appointmentService.onAppointmentsChange(loadAppointments);
    return unsubscribe;
  }, []);

  // Carregar histórico de relatórios do localStorage ou inicializar com dados padrão
  useEffect(() => {
    const saved = localStorage.getItem('reportHistory');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          setReportHistory(parsed);
        } else {
          // Inicializar com dados padrão se não houver histórico válido
          const now = new Date();
          const defaultReports: ReportHistory[] = [
            {
              id: '1',
              name: 'Relatório Financeiro - Este Mês',
              date: now.toLocaleDateString('pt-BR'),
              size: '1.2 MB',
              type: 'financeiro',
            },
            {
              id: '2',
              name: 'Relatório de Consultas - Este Mês',
              date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
              size: '0.8 MB',
              type: 'consultas',
            },
            {
              id: '3',
              name: 'Relatório de Agendamentos - Esta Semana',
              date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
              size: '0.6 MB',
              type: 'agendamentos',
            },
          ];
          setReportHistory(defaultReports);
          localStorage.setItem('reportHistory', JSON.stringify(defaultReports));
        }
      } catch (e) {
        console.error('Erro ao carregar histórico de relatórios:', e);
        const now = new Date();
        const defaultReports: ReportHistory[] = [
          {
            id: '1',
            name: 'Relatório Financeiro - Este Mês',
            date: now.toLocaleDateString('pt-BR'),
            size: '1.2 MB',
            type: 'financeiro',
          },
          {
            id: '2',
            name: 'Relatório de Consultas - Este Mês',
            date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
            size: '0.8 MB',
            type: 'consultas',
          },
          {
            id: '3',
            name: 'Relatório de Agendamentos - Esta Semana',
            date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
            size: '0.6 MB',
            type: 'agendamentos',
          },
        ];
        setReportHistory(defaultReports);
        localStorage.setItem('reportHistory', JSON.stringify(defaultReports));
      }
    } else {
      // Inicializar com dados padrão se não houver histórico salvo
      const now = new Date();
      const defaultReports: ReportHistory[] = [
        {
          id: '1',
          name: 'Relatório Financeiro - Este Mês',
          date: now.toLocaleDateString('pt-BR'),
          size: '1.2 MB',
          type: 'financeiro',
        },
        {
          id: '2',
          name: 'Relatório de Consultas - Este Mês',
          date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
          size: '0.8 MB',
          type: 'consultas',
        },
        {
          id: '3',
          name: 'Relatório de Agendamentos - Esta Semana',
          date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
          size: '0.6 MB',
          type: 'agendamentos',
        },
      ];
      setReportHistory(defaultReports);
      localStorage.setItem('reportHistory', JSON.stringify(defaultReports));
    }
  }, []);

  // Função para obter período de datas baseado no filtro
  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (periodFilter) {
      case "today":
        return { start: today, end: today };
      case "week": {
        const start = new Date(today);
        start.setDate(today.getDate() - today.getDay());
        return { start, end: today };
      }
      case "month": {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return { start, end };
      }
      case "year": {
        const start = new Date(today.getFullYear(), 0, 1);
        const end = new Date(today.getFullYear(), 11, 31);
        return { start, end };
      }
      default:
        return { start: new Date(today.getFullYear(), today.getMonth(), 1), end: today };
    }
  };

  // Filtrar agendamentos por período
  const filteredAppointments = useMemo(() => {
    const { start, end } = getDateRange();
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date + 'T00:00:00');
      return aptDate >= start && aptDate <= end && apt.status === 'confirmed';
    });
  }, [appointments, periodFilter]);

  // Calcular métricas principais
  const metrics = useMemo(() => {
    const totalAppointments = filteredAppointments.length;
    const totalRevenue = filteredAppointments.reduce((sum, apt) => {
      // Valores estimados por tipo de consulta
      const values: Record<string, number> = {
        'Consulta': 250,
        'Retorno': 150,
        'Procedimento': 500,
        'Exame': 300,
      };
      return sum + (values[apt.type] || 200);
    }, 0);

    // Calcular taxa de ocupação (estimativa baseada em agendamentos confirmados)
    const workingDays = filteredAppointments.length > 0 ? Math.ceil(filteredAppointments.length / 8) : 0;
    const totalSlots = workingDays * 20; // 20 slots por dia
    const occupancyRate = totalSlots > 0 ? (totalAppointments / totalSlots) * 100 : 0;

    // Calcular ticket médio
    const averageTicket = totalAppointments > 0 ? totalRevenue / totalAppointments : 0;

    return {
      totalRevenue,
      totalAppointments,
      occupancyRate: Math.min(occupancyRate, 100),
      averageTicket: Math.round(averageTicket * 100) / 100, // Arredondar para 2 casas decimais
    };
  }, [filteredAppointments]);

  // Dados de receita por categoria
  const revenueData = useMemo(() => {
    const { start } = getDateRange();
    const months: string[] = [];
    const data: Record<string, number>[] = [];

    if (periodFilter === "year") {
      for (let i = 0; i < 12; i++) {
        const monthDate = new Date(start.getFullYear(), i, 1);
        const monthName = monthDate.toLocaleDateString('pt-BR', { month: 'short' });
        months.push(monthName.charAt(0).toUpperCase() + monthName.slice(1));
        
        const monthAppointments = appointments.filter(apt => {
          const aptDate = new Date(apt.date + 'T00:00:00');
          return aptDate.getMonth() === i && aptDate.getFullYear() === start.getFullYear() && apt.status === 'confirmed';
        });

        const values: Record<string, number> = {
          'Consulta': 250,
          'Retorno': 150,
          'Procedimento': 500,
          'Exame': 300,
        };

        data.push({
          month: months[i],
          consultas: monthAppointments.filter(a => a.type === 'Consulta' || a.type.includes('Consulta')).reduce((s, a) => s + (values[a.type] || 250), 0),
          procedimentos: monthAppointments.filter(a => a.type.includes('Procedimento')).reduce((s, a) => s + (values[a.type] || 500), 0),
          retornos: monthAppointments.filter(a => a.type === 'Retorno').reduce((s, a) => s + (values[a.type] || 150), 0),
        });
      }
    } else {
      // Para períodos menores, agrupar por semana ou dia
      const { start: rangeStart, end: rangeEnd } = getDateRange();
      const days = Math.ceil((rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24));
      
      if (days <= 7) {
        // Por dia
        for (let i = 0; i <= days; i++) {
          const dayDate = new Date(rangeStart);
          dayDate.setDate(rangeStart.getDate() + i);
          const dayStr = dayDate.getDate().toString().padStart(2, '0');
          
          const dayAppointments = filteredAppointments.filter(apt => apt.date === dayDate.toISOString().split('T')[0]);
          const values: Record<string, number> = {
            'Consulta': 250,
            'Retorno': 150,
            'Procedimento': 500,
            'Exame': 300,
          };

          data.push({
            month: dayStr,
            consultas: dayAppointments.filter(a => a.type === 'Consulta' || a.type.includes('Consulta')).reduce((s, a) => s + (values[a.type] || 250), 0),
            procedimentos: dayAppointments.filter(a => a.type.includes('Procedimento')).reduce((s, a) => s + (values[a.type] || 500), 0),
            retornos: dayAppointments.filter(a => a.type === 'Retorno').reduce((s, a) => s + (values[a.type] || 150), 0),
          });
        }
      } else {
        // Por semana
        const weeks = Math.ceil(days / 7);
        for (let i = 0; i < weeks; i++) {
          const weekStart = new Date(rangeStart);
          weekStart.setDate(rangeStart.getDate() + (i * 7));
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          
          const weekAppointments = filteredAppointments.filter(apt => {
            const aptDate = new Date(apt.date + 'T00:00:00');
            return aptDate >= weekStart && aptDate <= weekEnd;
          });

          const values: Record<string, number> = {
            'Consulta': 250,
            'Retorno': 150,
            'Procedimento': 500,
            'Exame': 300,
          };

          data.push({
            month: `Sem ${i + 1}`,
            consultas: weekAppointments.filter(a => a.type === 'Consulta' || a.type.includes('Consulta')).reduce((s, a) => s + (values[a.type] || 250), 0),
            procedimentos: weekAppointments.filter(a => a.type.includes('Procedimento')).reduce((s, a) => s + (values[a.type] || 500), 0),
            retornos: weekAppointments.filter(a => a.type === 'Retorno').reduce((s, a) => s + (values[a.type] || 150), 0),
          });
        }
      }
    }

    return data.length > 0 ? data : [
      { month: "Sem dados", consultas: 0, procedimentos: 0, retornos: 0 }
    ];
  }, [filteredAppointments, periodFilter, appointments]);

  // Dados de distribuição de atendimentos
  const appointmentData = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    filteredAppointments.forEach(apt => {
      if (apt.type.includes('Consulta') || apt.type === 'Consulta') {
        typeCounts['Consultas'] = (typeCounts['Consultas'] || 0) + 1;
      } else if (apt.type === 'Retorno') {
        typeCounts['Retornos'] = (typeCounts['Retornos'] || 0) + 1;
      } else if (apt.type.includes('Procedimento')) {
        typeCounts['Procedimentos'] = (typeCounts['Procedimentos'] || 0) + 1;
      } else if (apt.type.includes('Exame')) {
        typeCounts['Exames'] = (typeCounts['Exames'] || 0) + 1;
      }
    });

    return [
      { name: "Consultas", value: typeCounts['Consultas'] || 0, color: "#10b77f" },
      { name: "Retornos", value: typeCounts['Retornos'] || 0, color: "#3b82f6" },
      { name: "Procedimentos", value: typeCounts['Procedimentos'] || 0, color: "#f59e0b" },
      { name: "Exames", value: typeCounts['Exames'] || 0, color: "#8b5cf6" },
    ].filter(item => item.value > 0);
  }, [filteredAppointments]);

  // Dados de performance por profissional
  const professionalData = useMemo(() => {
    const professionalCounts: Record<string, { consultas: number; total: number; receita: number }> = {};
    const values: Record<string, number> = {
      'Consulta': 250,
      'Retorno': 150,
      'Procedimento': 500,
      'Exame': 300,
    };
    
    filteredAppointments.forEach(apt => {
      if (!professionalCounts[apt.professional]) {
        professionalCounts[apt.professional] = { consultas: 0, total: 0, receita: 0 };
      }
      professionalCounts[apt.professional].consultas++;
      professionalCounts[apt.professional].total++;
      professionalCounts[apt.professional].receita += (values[apt.type] || 200);
    });

    return Object.entries(professionalCounts)
      .map(([name, data]) => ({
        name,
        consultas: data.consultas,
        receitaMedia: data.total > 0 ? Math.round((data.receita / data.total) * 100) / 100 : 0, // Ticket médio do profissional
      }))
      .sort((a, b) => b.consultas - a.consultas)
      .slice(0, 4);
  }, [filteredAppointments]);

  // Dados de formas de pagamento (mock - seria buscado de pagamentos reais)
  const paymentData = useMemo(() => {
    // Valores estimados baseados em padrões comuns
    const total = metrics.totalRevenue;
    return [
      { name: "PIX", value: Math.round((total * 0.35) / (total / 100)) || 35 },
      { name: "Cartão", value: Math.round((total * 0.40) / (total / 100)) || 40 },
      { name: "Dinheiro", value: Math.round((total * 0.15) / (total / 100)) || 15 },
      { name: "Convênio", value: Math.round((total * 0.10) / (total / 100)) || 10 },
    ];
  }, [metrics.totalRevenue]);

  const COLORS = ["#10b77f", "#3b82f6", "#f59e0b", "#8b5cf6"];

  const reports = [
    {
      title: "Relatório de Consultas",
      description: "Total de consultas realizadas por período",
      icon: Activity,
      color: "bg-primary/10 text-primary",
      type: "consultas"
    },
    {
      title: "Relatório Financeiro",
      description: "Receitas, despesas e fluxo de caixa",
      icon: DollarSign,
      color: "bg-success/10 text-success",
      type: "financeiro"
    },
    {
      title: "Relatório de Pacientes",
      description: "Cadastros, ativos e histórico",
      icon: Users,
      color: "bg-info/10 text-info",
      type: "pacientes"
    },
    {
      title: "Relatório de Agendamentos",
      description: "Taxa de ocupação e confirmações",
      icon: Calendar,
      color: "bg-purple-500/10 text-purple-600",
      type: "agendamentos"
    },
    {
      title: "Relatório de Equipe",
      description: "Performance e produtividade",
      icon: TrendingUp,
      color: "bg-warning/10 text-warning",
      type: "equipe"
    },
    {
      title: "Relatório de Horários",
      description: "Análise de horários e disponibilidade",
      icon: Clock,
      color: "bg-orange-500/10 text-orange-600",
      type: "horarios"
    },
  ];

  // Função para gerar relatório em PDF
  const generatePDFReport = (reportType: string, reportTitle: string) => {
    try {
      console.log('Gerando PDF:', reportTitle, reportType);
      
      // Verificar se jsPDF está disponível
      if (!jsPDF) {
        throw new Error('jsPDF não está disponível');
      }
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      let yPos = margin;

      // Função auxiliar para adicionar texto com quebra de linha
      const addText = (text: string, fontSize: number, isBold: boolean = false, align: 'left' | 'center' | 'right' = 'left') => {
        // Garantir que text não seja null ou undefined
        const safeText = text || '';
        if (!safeText) return;
        
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        try {
          // Usar splitTextToSize se disponível
          if (typeof doc.splitTextToSize === 'function') {
            const lines = doc.splitTextToSize(safeText, maxWidth);
            if (lines && Array.isArray(lines) && lines.length > 0) {
              lines.forEach((line: string) => {
                if (line && typeof line === 'string') {
                  if (yPos > pageHeight - margin - 10) {
                    doc.addPage();
                    yPos = margin;
                  }
                  const xPos = align === 'center' ? pageWidth / 2 : align === 'right' ? pageWidth - margin : margin;
                  doc.text(line, xPos, yPos, { align });
                  yPos += fontSize * 0.5;
                }
              });
            } else {
              throw new Error('splitTextToSize retornou valor inválido');
            }
          } else {
            // Fallback: quebrar manualmente o texto por caracteres
            const charPerLine = Math.floor(maxWidth / (fontSize * 0.5));
            const lines: string[] = [];
            let currentLine = '';
            
            for (let i = 0; i < safeText.length; i++) {
              currentLine += safeText[i];
              if (currentLine.length >= charPerLine || safeText[i] === '\n') {
                lines.push(currentLine.trim());
                currentLine = '';
              }
            }
            if (currentLine.trim()) {
              lines.push(currentLine.trim());
            }
            
            lines.forEach((line) => {
              if (line) {
                if (yPos > pageHeight - margin - 10) {
                  doc.addPage();
                  yPos = margin;
                }
                const xPos = align === 'center' ? pageWidth / 2 : align === 'right' ? pageWidth - margin : margin;
                doc.text(line || ' ', xPos, yPos, { align });
                yPos += fontSize * 0.5;
              }
            });
          }
        } catch (e) {
          // Fallback final: texto simples truncado
          if (yPos > pageHeight - margin - 10) {
            doc.addPage();
            yPos = margin;
          }
          const xPos = align === 'center' ? pageWidth / 2 : align === 'right' ? pageWidth - margin : margin;
          const truncatedText = safeText.length > 80 ? safeText.substring(0, 77) + '...' : safeText;
          doc.text(truncatedText || ' ', xPos, yPos, { align });
          yPos += fontSize * 0.5;
        }
        yPos += 5;
      };

      // Cabeçalho
      const safeReportTitle = reportTitle || 'Relatório';
      addText(safeReportTitle, 18, true, 'center');
      const periodText = periodFilter === "today" ? "Hoje" :
                         periodFilter === "week" ? "Esta Semana" :
                         periodFilter === "month" ? "Este Mês" :
                         periodFilter === "year" ? "Este Ano" : "Período Personalizado";
      addText(`Período: ${periodText || 'Não especificado'}`, 12, false, 'center');
      
      const dateStr = new Date().toLocaleDateString('pt-BR') || new Date().toISOString().split('T')[0];
      addText(`Gerado em: ${dateStr}`, 10, false, 'center');
      yPos += 10;

      // Linha divisória
      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.3);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      // Conteúdo específico por tipo de relatório
      const safeMetrics = metrics || {
        totalAppointments: 0,
        totalRevenue: 0,
        occupancyRate: 0,
        averageTicket: 0,
      };
      const safeAppointments = filteredAppointments || [];
      
      // Função auxiliar para adicionar linha de agendamento
      const addAppointmentLine = (apt: Appointment, index: number) => {
        if (!apt) return;
        if (yPos > pageHeight - margin - 10) {
          doc.addPage();
          yPos = margin;
        }
        try {
          const dateFormatted = apt.date ? new Date(apt.date + 'T00:00:00').toLocaleDateString('pt-BR') : 'Data não disponível';
          const patient = apt.patient || 'Paciente não informado';
          const type = apt.type || 'Tipo não informado';
          const time = apt.time || '';
          const professional = apt.professional || '';
          const line = `${index + 1}. ${patient} - ${type} - ${dateFormatted} ${time} ${professional ? '- ' + professional : ''}`.trim();
          
          if (!line) return;
          
          if (typeof doc.splitTextToSize === 'function') {
            const lines = doc.splitTextToSize(line, maxWidth);
            if (lines && Array.isArray(lines) && lines.length > 0) {
              lines.forEach((lineText: string) => {
                if (lineText && typeof lineText === 'string') {
                  if (yPos > pageHeight - margin - 10) {
                    doc.addPage();
                    yPos = margin;
                  }
                  doc.text(lineText, margin, yPos);
                  yPos += 5;
                }
              });
            } else {
              const truncatedLine = line.length > 80 ? line.substring(0, 77) + '...' : line;
              doc.text(truncatedLine, margin, yPos);
              yPos += 5;
            }
          } else {
            const truncatedLine = line.length > 80 ? line.substring(0, 77) + '...' : line;
            doc.text(truncatedLine, margin, yPos);
            yPos += 5;
          }
        } catch (e) {
          console.error('Erro ao processar agendamento:', e, apt);
        }
      };
      
      // Gerar conteúdo baseado no tipo de relatório
      switch (reportType) {
        case 'consultas': {
          const consultas = safeAppointments.filter(apt => 
            apt.type === 'Consulta' || apt.type.includes('Consulta')
          );
          const values: Record<string, number> = {
            'Consulta': 250,
            'Retorno': 150,
            'Procedimento': 500,
            'Exame': 300,
          };
          const receitaConsultas = consultas.reduce((sum, apt) => 
            sum + (values[apt.type] || 250), 0
          );
          
          addText("RESUMO DE CONSULTAS", 14, true);
          addText(`Total de Consultas: ${consultas.length}`, 10);
          addText(`Receita de Consultas: R$ ${receitaConsultas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 10);
          addText(`Média por Consulta: R$ ${consultas.length > 0 ? (receitaConsultas / consultas.length).toFixed(2) : '0,00'}`, 10);
          yPos += 10;
          
          if (consultas.length > 0) {
            addText("LISTA DE CONSULTAS", 12, true);
            doc.setFontSize(8);
            consultas.slice(0, 30).forEach((apt, index) => {
              addAppointmentLine(apt, index + 1);
            });
          } else {
            addText("Nenhuma consulta encontrada para o período selecionado.", 10);
          }
          break;
        }
        
        case 'financeiro': {
          const values: Record<string, number> = {
            'Consulta': 250,
            'Retorno': 150,
            'Procedimento': 500,
            'Exame': 300,
          };
          const receitaTotal = safeAppointments.reduce((sum, apt) => 
            sum + (values[apt.type] || 200), 0
          );
          
          // Agrupar por tipo
          const receitaPorTipo: Record<string, number> = {};
          safeAppointments.forEach(apt => {
            const tipo = apt.type || 'Outros';
            receitaPorTipo[tipo] = (receitaPorTipo[tipo] || 0) + (values[apt.type] || 200);
          });
          
          addText("RESUMO FINANCEIRO", 14, true);
          addText(`Receita Total: R$ ${receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 10);
          addText(`Total de Transações: ${safeAppointments.length}`, 10);
          addText(`Ticket Médio: R$ ${safeAppointments.length > 0 ? (receitaTotal / safeAppointments.length).toFixed(2) : '0,00'}`, 10);
          yPos += 10;
          
          addText("RECEITA POR TIPO DE SERVIÇO", 12, true);
          doc.setFontSize(9);
          Object.entries(receitaPorTipo).forEach(([tipo, valor]) => {
            addText(`${tipo}: R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 9);
          });
          yPos += 10;
          
          if (safeAppointments.length > 0) {
            addText("TRANSAÇÕES RECENTES", 12, true);
            doc.setFontSize(8);
            safeAppointments.slice(0, 25).forEach((apt, index) => {
              const valor = values[apt.type] || 200;
              const dateFormatted = apt.date ? new Date(apt.date + 'T00:00:00').toLocaleDateString('pt-BR') : '';
              const line = `${index + 1}. ${apt.patient} - ${apt.type} - ${dateFormatted} - R$ ${valor.toFixed(2)}`;
              if (typeof doc.splitTextToSize === 'function') {
                const lines = doc.splitTextToSize(line, maxWidth);
                if (lines && Array.isArray(lines)) {
                  lines.forEach((lineText: string) => {
                    if (lineText && typeof lineText === 'string') {
                      if (yPos > pageHeight - margin - 10) {
                        doc.addPage();
                        yPos = margin;
                      }
                      doc.text(lineText, margin, yPos);
                      yPos += 5;
                    }
                  });
                }
              }
            });
          }
          break;
        }
        
        case 'pacientes': {
          const pacientesUnicos = new Set(safeAppointments.map(apt => apt.patient));
          const pacientesComContagem: Record<string, number> = {};
          safeAppointments.forEach(apt => {
            pacientesComContagem[apt.patient] = (pacientesComContagem[apt.patient] || 0) + 1;
          });
          
          addText("RESUMO DE PACIENTES", 14, true);
          addText(`Total de Pacientes Únicos: ${pacientesUnicos.size}`, 10);
          addText(`Total de Atendimentos: ${safeAppointments.length}`, 10);
          addText(`Média de Atendimentos por Paciente: ${pacientesUnicos.size > 0 ? (safeAppointments.length / pacientesUnicos.size).toFixed(1) : '0'}`, 10);
          yPos += 10;
          
          addText("PACIENTES MAIS ATENDIDOS", 12, true);
          doc.setFontSize(9);
          const pacientesOrdenados = Object.entries(pacientesComContagem)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20);
          
          pacientesOrdenados.forEach(([paciente, count], index) => {
            addText(`${index + 1}. ${paciente}: ${count} atendimento(s)`, 9);
          });
          break;
        }
        
        case 'agendamentos': {
          addText("RESUMO DE AGENDAMENTOS", 14, true);
          addText(`Total de Agendamentos: ${safeMetrics.totalAppointments || 0}`, 10);
          addText(`Taxa de Ocupação: ${(safeMetrics.occupancyRate || 0).toFixed(1)}%`, 10);
          addText(`Receita Total: R$ ${(safeMetrics.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 10);
          yPos += 10;
          
          // Distribuição por tipo
          const tipoCounts: Record<string, number> = {};
          safeAppointments.forEach(apt => {
            tipoCounts[apt.type] = (tipoCounts[apt.type] || 0) + 1;
          });
          
          addText("DISTRIBUIÇÃO POR TIPO", 12, true);
          doc.setFontSize(9);
          Object.entries(tipoCounts).forEach(([tipo, count]) => {
            addText(`${tipo}: ${count} agendamento(s)`, 9);
          });
          yPos += 10;
          
          if (safeAppointments.length > 0) {
            addText("AGENDAMENTOS RECENTES", 12, true);
            doc.setFontSize(8);
            safeAppointments.slice(0, 25).forEach((apt, index) => {
              addAppointmentLine(apt, index + 1);
            });
          } else {
            addText("Nenhum agendamento encontrado para o período selecionado.", 10);
          }
          break;
        }
        
        case 'equipe': {
          const professionalCounts: Record<string, { total: number; receita: number }> = {};
          const values: Record<string, number> = {
            'Consulta': 250,
            'Retorno': 150,
            'Procedimento': 500,
            'Exame': 300,
          };
          
          safeAppointments.forEach(apt => {
            if (!professionalCounts[apt.professional]) {
              professionalCounts[apt.professional] = { total: 0, receita: 0 };
            }
            professionalCounts[apt.professional].total++;
            professionalCounts[apt.professional].receita += (values[apt.type] || 200);
          });
          
          addText("RESUMO DE EQUIPE", 14, true);
          addText(`Total de Profissionais: ${Object.keys(professionalCounts).length}`, 10);
          addText(`Total de Atendimentos: ${safeAppointments.length}`, 10);
          yPos += 10;
          
          addText("PERFORMANCE POR PROFISSIONAL", 12, true);
          doc.setFontSize(9);
          const profissionaisOrdenados = Object.entries(professionalCounts)
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, 15);
          
          profissionaisOrdenados.forEach(([profissional, data], index) => {
            addText(`${index + 1}. ${profissional}`, 10, true);
            addText(`   Atendimentos: ${data.total}`, 9);
            addText(`   Receita Gerada: R$ ${data.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 9);
            addText(`   Média por Atendimento: R$ ${(data.receita / data.total).toFixed(2)}`, 9);
            yPos += 5;
          });
          break;
        }
        
        case 'horarios': {
          const horariosCount: Record<string, number> = {};
          const diasCount: Record<string, number> = {};
          
          safeAppointments.forEach(apt => {
            const hora = apt.time ? apt.time.split(':')[0] + ':00' : 'Não informado';
            horariosCount[hora] = (horariosCount[hora] || 0) + 1;
            
            if (apt.date) {
              const diaSemana = new Date(apt.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long' });
              diasCount[diaSemana] = (diasCount[diaSemana] || 0) + 1;
            }
          });
          
          addText("ANÁLISE DE HORÁRIOS", 14, true);
          addText(`Total de Agendamentos: ${safeAppointments.length}`, 10);
          addText(`Taxa de Ocupação: ${(safeMetrics.occupancyRate || 0).toFixed(1)}%`, 10);
          yPos += 10;
          
          addText("DISTRIBUIÇÃO POR HORÁRIO", 12, true);
          doc.setFontSize(9);
          const horariosOrdenados = Object.entries(horariosCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15);
          
          horariosOrdenados.forEach(([hora, count]) => {
            addText(`${hora}: ${count} agendamento(s)`, 9);
          });
          yPos += 10;
          
          addText("DISTRIBUIÇÃO POR DIA DA SEMANA", 12, true);
          doc.setFontSize(9);
          Object.entries(diasCount).forEach(([dia, count]) => {
            addText(`${dia}: ${count} agendamento(s)`, 9);
          });
          break;
        }
        
        default: {
          // Relatório genérico
          addText("RESUMO", 14, true);
          addText(`Total de Agendamentos: ${safeMetrics.totalAppointments || 0}`, 10);
          addText(`Receita Total: R$ ${(safeMetrics.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 10);
          addText(`Taxa de Ocupação: ${(safeMetrics.occupancyRate || 0).toFixed(1)}%`, 10);
          yPos += 10;
          
          if (safeAppointments.length > 0) {
            addText("AGENDAMENTOS RECENTES", 12, true);
            doc.setFontSize(8);
            safeAppointments.slice(0, 20).forEach((apt, index) => {
              addAppointmentLine(apt, index + 1);
            });
          } else {
            addText("Nenhum agendamento encontrado para o período selecionado.", 10);
          }
        }
      }

      // Salvar PDF
      const safeFileName = (safeReportTitle || 'relatorio').replace(/\s+/g, '_');
      const safeDateStr = (dateStr || new Date().toISOString().split('T')[0]).replace(/\//g, '-');
      const fileName = `${safeFileName}_${safeDateStr}.pdf`;
      
      // Calcular tamanho estimado do PDF
      const pdfString = doc.output('string') || '';
      const estimatedSizeKB = pdfString.length ? pdfString.length / 1024 : 0;
      const fileSizeMB = (estimatedSizeKB / 1024).toFixed(2);
      
      doc.save(fileName);

      // Adicionar ao histórico
      const newReport: ReportHistory = {
        id: Date.now().toString(),
        name: `${safeReportTitle} - ${periodText || 'Período não especificado'}`,
        date: dateStr,
        size: `${fileSizeMB} MB`,
        type: reportType || 'geral',
      };
      const safeHistory = reportHistory || [];
      const updatedHistory = [newReport, ...safeHistory].slice(0, 10);
      setReportHistory(updatedHistory);
      localStorage.setItem('reportHistory', JSON.stringify(updatedHistory));

      toast.success(`${safeReportTitle} gerado com sucesso!`);
      console.log('PDF gerado com sucesso:', fileName);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error(`Erro ao gerar o relatório PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  // Função para gerar relatório em CSV
  const generateCSVReport = (reportType: string, reportTitle: string) => {
    const safeAppointments = filteredAppointments || [];
    const periodText = periodFilter === "today" ? "Hoje" : 
                       periodFilter === "week" ? "Esta Semana" : 
                       periodFilter === "month" ? "Este Mês" : 
                       periodFilter === "year" ? "Este Ano" : "Personalizado";
    
    let csv = `${reportTitle}\n`;
    csv += `Período: ${periodText}\n`;
    csv += `Gerado em: ${new Date().toLocaleDateString('pt-BR')}\n\n`;
    
    const values: Record<string, number> = {
      'Consulta': 250,
      'Retorno': 150,
      'Procedimento': 500,
      'Exame': 300,
    };
    
    switch (reportType) {
      case 'consultas': {
        const consultas = safeAppointments.filter(apt => 
          apt.type === 'Consulta' || apt.type.includes('Consulta')
        );
        csv += "Paciente,Tipo,Profissional,Data,Hora,Valor\n";
        consultas.forEach(apt => {
          const valor = values[apt.type] || 250;
          csv += `"${apt.patient}","${apt.type}","${apt.professional}","${new Date(apt.date + 'T00:00:00').toLocaleDateString('pt-BR')}","${apt.time}","R$ ${valor.toFixed(2)}"\n`;
        });
        break;
      }
      
      case 'financeiro': {
        csv += "Paciente,Tipo de Serviço,Profissional,Data,Hora,Valor\n";
        safeAppointments.forEach(apt => {
          const valor = values[apt.type] || 200;
          csv += `"${apt.patient}","${apt.type}","${apt.professional}","${new Date(apt.date + 'T00:00:00').toLocaleDateString('pt-BR')}","${apt.time}","R$ ${valor.toFixed(2)}"\n`;
        });
        break;
      }
      
      case 'pacientes': {
        const pacientesComContagem: Record<string, number> = {};
        safeAppointments.forEach(apt => {
          pacientesComContagem[apt.patient] = (pacientesComContagem[apt.patient] || 0) + 1;
        });
        csv += "Paciente,Total de Atendimentos\n";
        Object.entries(pacientesComContagem)
          .sort((a, b) => b[1] - a[1])
          .forEach(([paciente, count]) => {
            csv += `"${paciente}","${count}"\n`;
          });
        break;
      }
      
      case 'equipe': {
        const professionalCounts: Record<string, { total: number; receita: number }> = {};
        safeAppointments.forEach(apt => {
          if (!professionalCounts[apt.professional]) {
            professionalCounts[apt.professional] = { total: 0, receita: 0 };
          }
          professionalCounts[apt.professional].total++;
          professionalCounts[apt.professional].receita += (values[apt.type] || 200);
        });
        csv += "Profissional,Total de Atendimentos,Receita Gerada,Média por Atendimento\n";
        Object.entries(professionalCounts)
          .sort((a, b) => b[1].total - a[1].total)
          .forEach(([profissional, data]) => {
            csv += `"${profissional}","${data.total}","R$ ${data.receita.toFixed(2)}","R$ ${(data.receita / data.total).toFixed(2)}"\n`;
          });
        break;
      }
      
      case 'horarios': {
        csv += "Horário,Quantidade de Agendamentos\n";
        const horariosCount: Record<string, number> = {};
        safeAppointments.forEach(apt => {
          const hora = apt.time ? apt.time.split(':')[0] + ':00' : 'Não informado';
          horariosCount[hora] = (horariosCount[hora] || 0) + 1;
        });
        Object.entries(horariosCount)
          .sort((a, b) => b[1] - a[1])
          .forEach(([hora, count]) => {
            csv += `"${hora}","${count}"\n`;
          });
        break;
      }
      
      default: {
        csv += "Paciente,Tipo,Profissional,Data,Hora,Status\n";
        safeAppointments.forEach(apt => {
          csv += `"${apt.patient}","${apt.type}","${apt.professional}","${new Date(apt.date + 'T00:00:00').toLocaleDateString('pt-BR')}","${apt.time}","${apt.status}"\n`;
        });
      }
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportTitle.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`${reportTitle} exportado em CSV!`);
  };

  const handleGenerateReport = (reportTitle: string, reportType: string) => {
    console.log('handleGenerateReport chamado:', reportTitle, reportType);
    try {
      generatePDFReport(reportType, reportTitle);
    } catch (error) {
      console.error('Erro em handleGenerateReport:', error);
      toast.error('Erro ao processar solicitação de relatório');
    }
  };

  const handleDownloadReport = (reportTitle: string, reportType: string) => {
    generateCSVReport(reportType, reportTitle);
  };

  const handleViewReport = (report: ReportHistory) => {
    console.log('handleViewReport chamado:', report);
    try {
      // Abrir o dialog para visualização na tela
      setViewingReport(report);
    } catch (error) {
      console.error('Erro em handleViewReport:', error);
      toast.error('Erro ao visualizar relatório');
    }
  };

  // Função para renderizar o conteúdo do relatório na tela
  const renderReportContent = (report: ReportHistory) => {
    const safeAppointments = filteredAppointments || [];
    const safeMetrics = metrics || {
      totalAppointments: 0,
      totalRevenue: 0,
      occupancyRate: 0,
      averageTicket: 0,
    };
    const values: Record<string, number> = {
      'Consulta': 250,
      'Retorno': 150,
      'Procedimento': 500,
      'Exame': 300,
    };

    switch (report.type) {
      case 'consultas': {
        const consultas = safeAppointments.filter(apt => 
          apt.type === 'Consulta' || apt.type.includes('Consulta')
        );
        const receitaConsultas = consultas.reduce((sum, apt) => 
          sum + (values[apt.type] || 250), 0
        );
        
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{consultas.length}</div>
                  <div className="text-sm text-muted-foreground">Total de Consultas</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">R$ {receitaConsultas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  <div className="text-sm text-muted-foreground">Receita de Consultas</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">R$ {consultas.length > 0 ? (receitaConsultas / consultas.length).toFixed(2) : '0,00'}</div>
                  <div className="text-sm text-muted-foreground">Média por Consulta</div>
                </CardContent>
              </Card>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Lista de Consultas</h3>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {consultas.slice(0, 30).map((apt, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="font-medium">{apt.patient}</div>
                      <div className="text-sm text-muted-foreground">
                        {apt.type} - {apt.date ? new Date(apt.date + 'T00:00:00').toLocaleDateString('pt-BR') : ''} {apt.time} - {apt.professional}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        );
      }
      
      case 'financeiro': {
        const receitaTotal = safeAppointments.reduce((sum, apt) => 
          sum + (values[apt.type] || 200), 0
        );
        const receitaPorTipo: Record<string, number> = {};
        safeAppointments.forEach(apt => {
          const tipo = apt.type || 'Outros';
          receitaPorTipo[tipo] = (receitaPorTipo[tipo] || 0) + (values[apt.type] || 200);
        });
        
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">R$ {receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  <div className="text-sm text-muted-foreground">Receita Total</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{safeAppointments.length}</div>
                  <div className="text-sm text-muted-foreground">Total de Transações</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">R$ {safeAppointments.length > 0 ? (receitaTotal / safeAppointments.length).toFixed(2) : '0,00'}</div>
                  <div className="text-sm text-muted-foreground">Ticket Médio</div>
                </CardContent>
              </Card>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Receita por Tipo de Serviço</h3>
              <div className="space-y-2">
                {Object.entries(receitaPorTipo).map(([tipo, valor]) => (
                  <div key={tipo} className="flex justify-between p-2 border rounded">
                    <span>{tipo}</span>
                    <span className="font-medium">R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Transações Recentes</h3>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {safeAppointments.slice(0, 25).map((apt, index) => {
                    const valor = values[apt.type] || 200;
                    return (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="font-medium">{apt.patient} - {apt.type}</div>
                        <div className="text-sm text-muted-foreground">
                          {apt.date ? new Date(apt.date + 'T00:00:00').toLocaleDateString('pt-BR') : ''} {apt.time} - R$ {valor.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
        );
      }
      
      case 'pacientes': {
        const pacientesComContagem: Record<string, number> = {};
        safeAppointments.forEach(apt => {
          pacientesComContagem[apt.patient] = (pacientesComContagem[apt.patient] || 0) + 1;
        });
        const pacientesUnicos = Object.keys(pacientesComContagem).length;
        const pacientesOrdenados = Object.entries(pacientesComContagem)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20);
        
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{pacientesUnicos}</div>
                  <div className="text-sm text-muted-foreground">Pacientes Únicos</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{safeAppointments.length}</div>
                  <div className="text-sm text-muted-foreground">Total de Atendimentos</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{pacientesUnicos > 0 ? (safeAppointments.length / pacientesUnicos).toFixed(1) : '0'}</div>
                  <div className="text-sm text-muted-foreground">Média por Paciente</div>
                </CardContent>
              </Card>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Pacientes Mais Atendidos</h3>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {pacientesOrdenados.map(([paciente, count], index) => (
                    <div key={index} className="flex justify-between p-3 border rounded-lg">
                      <span className="font-medium">{index + 1}. {paciente}</span>
                      <span className="text-muted-foreground">{count} atendimento(s)</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        );
      }
      
      case 'agendamentos': {
        const tipoCounts: Record<string, number> = {};
        safeAppointments.forEach(apt => {
          tipoCounts[apt.type] = (tipoCounts[apt.type] || 0) + 1;
        });
        
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{safeMetrics.totalAppointments || 0}</div>
                  <div className="text-sm text-muted-foreground">Total de Agendamentos</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{(safeMetrics.occupancyRate || 0).toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Taxa de Ocupação</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">R$ {(safeMetrics.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  <div className="text-sm text-muted-foreground">Receita Total</div>
                </CardContent>
              </Card>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Distribuição por Tipo</h3>
              <div className="space-y-2">
                {Object.entries(tipoCounts).map(([tipo, count]) => (
                  <div key={tipo} className="flex justify-between p-2 border rounded">
                    <span>{tipo}</span>
                    <span className="font-medium">{count} agendamento(s)</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Agendamentos Recentes</h3>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {safeAppointments.slice(0, 25).map((apt, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="font-medium">{apt.patient}</div>
                      <div className="text-sm text-muted-foreground">
                        {apt.type} - {apt.date ? new Date(apt.date + 'T00:00:00').toLocaleDateString('pt-BR') : ''} {apt.time} - {apt.professional}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        );
      }
      
      case 'equipe': {
        const professionalCounts: Record<string, { total: number; receita: number }> = {};
        safeAppointments.forEach(apt => {
          if (!professionalCounts[apt.professional]) {
            professionalCounts[apt.professional] = { total: 0, receita: 0 };
          }
          professionalCounts[apt.professional].total++;
          professionalCounts[apt.professional].receita += (values[apt.type] || 200);
        });
        const profissionaisOrdenados = Object.entries(professionalCounts)
          .sort((a, b) => b[1].total - a[1].total)
          .slice(0, 15);
        
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{Object.keys(professionalCounts).length}</div>
                  <div className="text-sm text-muted-foreground">Total de Profissionais</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{safeAppointments.length}</div>
                  <div className="text-sm text-muted-foreground">Total de Atendimentos</div>
                </CardContent>
              </Card>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Performance por Profissional</h3>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {profissionaisOrdenados.map(([profissional, data], index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="font-semibold mb-2">{index + 1}. {profissional}</div>
                        <div className="space-y-1 text-sm">
                          <div>Atendimentos: {data.total}</div>
                          <div>Receita Gerada: R$ {data.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                          <div>Média por Atendimento: R$ {(data.receita / data.total).toFixed(2)}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        );
      }
      
      case 'horarios': {
        const horariosCount: Record<string, number> = {};
        const diasCount: Record<string, number> = {};
        safeAppointments.forEach(apt => {
          const hora = apt.time ? apt.time.split(':')[0] + ':00' : 'Não informado';
          horariosCount[hora] = (horariosCount[hora] || 0) + 1;
          if (apt.date) {
            const diaSemana = new Date(apt.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long' });
            diasCount[diaSemana] = (diasCount[diaSemana] || 0) + 1;
          }
        });
        const horariosOrdenados = Object.entries(horariosCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 15);
        
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{safeAppointments.length}</div>
                  <div className="text-sm text-muted-foreground">Total de Agendamentos</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{(safeMetrics.occupancyRate || 0).toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Taxa de Ocupação</div>
                </CardContent>
              </Card>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Distribuição por Horário</h3>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {horariosOrdenados.map(([hora, count]) => (
                    <div key={hora} className="flex justify-between p-2 border rounded">
                      <span>{hora}</span>
                      <span className="font-medium">{count} agendamento(s)</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Distribuição por Dia da Semana</h3>
              <div className="space-y-2">
                {Object.entries(diasCount).map(([dia, count]) => (
                  <div key={dia} className="flex justify-between p-2 border rounded">
                    <span>{dia}</span>
                    <span className="font-medium">{count} agendamento(s)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
      
      default:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{safeMetrics.totalAppointments || 0}</div>
                  <div className="text-sm text-muted-foreground">Total de Agendamentos</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">R$ {(safeMetrics.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  <div className="text-sm text-muted-foreground">Receita Total</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{(safeMetrics.occupancyRate || 0).toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Taxa de Ocupação</div>
                </CardContent>
              </Card>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Agendamentos Recentes</h3>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {safeAppointments.slice(0, 20).map((apt, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="font-medium">{apt.patient}</div>
                      <div className="text-sm text-muted-foreground">
                        {apt.type} - {apt.date ? new Date(apt.date + 'T00:00:00').toLocaleDateString('pt-BR') : ''} {apt.time} - {apt.professional}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-2 sm:gap-3">
          <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0 mt-1" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Análises e insights gerenciais completos
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
              <SelectItem value="custom">Período Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              R$ {metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredAppointments.length} agendamentos confirmados
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Consultas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{metrics.totalAppointments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredAppointments.filter(a => a.type.includes('Consulta') || a.type === 'Consulta').length} consultas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Ocupação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{metrics.occupancyRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Baseado em agendamentos confirmados
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              R$ {metrics.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Valor médio por atendimento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Receita por Categoria</CardTitle>
            <CardDescription>Evolução mensal por tipo de atendimento</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Bar dataKey="consultas" fill="#10b77f" name="Consultas" />
                <Bar dataKey="procedimentos" fill="#3b82f6" name="Procedimentos" />
                <Bar dataKey="retornos" fill="#f59e0b" name="Retornos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Distribuição de Atendimentos</CardTitle>
            <CardDescription>Tipos de consultas realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            {appointmentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={appointmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {appointmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <p>Nenhum dado disponível para o período selecionado</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Performance por Profissional</CardTitle>
            <CardDescription>Consultas realizadas no mês</CardDescription>
          </CardHeader>
          <CardContent>
            {professionalData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={professionalData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="name" type="category" className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Bar dataKey="consultas" fill="#10b77f" name="Consultas" />
                <Bar dataKey="receitaMedia" fill="#3b82f6" name="Ticket Médio (R$)" />
              </BarChart>
            </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <p>Nenhum dado disponível para o período selecionado</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Formas de Pagamento</CardTitle>
            <CardDescription>Distribuição percentual</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Report Types */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>Tipos de Relatórios Disponíveis</CardTitle>
          <CardDescription>Gere relatórios específicos para análise detalhada</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report, index) => {
              const Icon = report.icon;
              return (
                <Card key={index} className="hover:shadow-md transition-shadow bg-gradient-to-br from-card to-muted/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${report.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardTitle className="mt-4 text-base">{report.title}</CardTitle>
                    <CardDescription className="text-xs">{report.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        size="sm"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleGenerateReport(report.title, report.type);
                        }}
                      >
                        Gerar PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDownloadReport(report.title, report.type);
                        }}
                        title="Baixar CSV"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>Relatórios Recentes</CardTitle>
          <CardDescription>Últimos relatórios gerados no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportHistory.length > 0 ? (
              reportHistory.map((report) => (
                <div
                  key={report.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-muted/50 to-muted/30 hover:from-muted/70 hover:to-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Gerado em {report.date} • {report.size}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleViewReport(report);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                    Visualizar
                  </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Regenerar o relatório para download
                        const reportConfig = reports.find(r => r.type === report.type);
                        if (reportConfig) {
                          handleDownloadReport(reportConfig.title, report.type);
                        }
                      }}
                      title="Baixar novamente"
                    >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum relatório gerado ainda</p>
                <p className="text-sm mt-1">Gere um relatório para ver o histórico aqui</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Visualização de Relatório */}
      <Dialog open={!!viewingReport} onOpenChange={(open) => !open && setViewingReport(null)}>
        <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col p-0">
          <div className="p-6 pb-4">
            <DialogHeader>
              <DialogTitle className="text-xl">{viewingReport?.name || 'Visualizar Relatório'}</DialogTitle>
              <DialogDescription>
                Gerado em {viewingReport?.date || new Date().toLocaleDateString('pt-BR')} • {viewingReport?.size || ''}
              </DialogDescription>
            </DialogHeader>
          </div>
          <ScrollArea className="flex-1 px-6">
            <div className="pr-4">
              {viewingReport && renderReportContent(viewingReport)}
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 pt-4 pb-6 px-6 border-t">
            <Button
              variant="outline"
              onClick={() => {
                const reportConfig = reports.find(r => r.type === viewingReport?.type);
                if (reportConfig && viewingReport) {
                  generatePDFReport(viewingReport.type, reportConfig.title);
                }
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
            <Button onClick={() => setViewingReport(null)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Relatorios;
